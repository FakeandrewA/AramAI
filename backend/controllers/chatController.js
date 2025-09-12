import mongoose from "mongoose";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import { generateChatName, safeJSONParse } from "../utils.js";

/**
 * Create a new chat with a default welcome message
 */
export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const name = generateChatName();
    // create chat with default AI message
    const chat = await Chat.create({
      user: userId,
      name: name,
      messages: [],
    });

    // push chatId to user (at start of list, sorted)
    await User.findByIdAndUpdate(userId, {
      $push: { chats: { $each: [chat._id], $position: 0 } },
    });

    res.status(201).json({
      _id: chat._id,
      name: chat.name,
      createdAt: chat.createdAt
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

/**
 * Handle user query -> send to AI -> save only if response is complete
 */

export const sendMessage = async (req, res) => {
  try {
    const { chatId, queryreceived,messageId , checkpoint_id } = req.query;
    if (!chatId || !queryreceived) {
      return res.status(400).json({ message: "chatId and queryreceived required" });
    }

    const query = JSON.parse(queryreceived);
    console.log(query);

    // 1️⃣ Add user message to DB (optimistic insert)
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { role: "user", content: query.query, messageid: messageId } },
    });

    // 2️⃣ Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let streamedContent = "";
    let searchInfo = { stages: [], query: "", urls: [], internalQuery: "", internalUrls: [], ragQuery: "", ragContext: "", error: null };
    let aiMessageSaved = false;

    // 3️⃣ Call AI API streaming endpoint
    let aiServiceUrl = `http://localhost:8000/chat_stream/${encodeURIComponent(query.query)}`;
    if (checkpoint_id) {
      aiServiceUrl += `?checkpoint_id=${encodeURIComponent(checkpoint_id)}`;
    }

    const aiResponse = await fetch(aiServiceUrl);

    if (!aiResponse.body) {
      throw new Error("No response body from AI service");
    }
    console.log(aiResponse);
    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true }).trim();
      if (!chunk) continue;

      const lines = chunk.split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          // 🔹 Strip `data:` prefix
          const cleanLine = line.startsWith("data:") ? line.replace(/^data:\s*/, "") : line;
          if (!cleanLine) continue;

          const data = safeJSONParse(cleanLine);

          // Stream to frontend
          res.write(`data: ${JSON.stringify(data)}\n\n`);

          // Build the persistent searchInfo object on the backend
          switch (data.type) {
            case "thinking":
              searchInfo.stages.push("thinking");
              break;
            case "search_start":
              searchInfo.stages.push("searching");
              searchInfo.query = data.query;
              break;
            case "search_results":
              searchInfo.stages.push("reading");
              searchInfo.urls = Array.isArray(data.urls) ? data.urls : [];
              break;
            case "i_search_start":
              searchInfo.stages.push("internal_searching");
              searchInfo.internalQuery = data.query;
              break;
            case "i_search_results":
              searchInfo.stages.push("internal_reading");
              const i_urls = Array.isArray(data.urls) ? data.urls : (data.url ? [data.url] : []);
              searchInfo.internalUrls = i_urls;
              break;
            case "rag_start":
              searchInfo.stages.push("rag_searching");
              searchInfo.ragQuery = data.query;
              break;
            case "rag_results":
              searchInfo.stages.push("rag_reading");
              searchInfo.ragContext = data.context;
              break;
            case "content":
              streamedContent += data.content;
              break;
            case "search_error":
              searchInfo.stages.push("error");
              searchInfo.error = data.message;
              break;
            case "end":
              searchInfo.stages.push("writing");
              // Now save the complete object
              if (streamedContent.trim()) {
                // Remove duplicates before saving
                searchInfo.stages = Array.from(new Set(searchInfo.stages));
                await Chat.findByIdAndUpdate(chatId, {
                  $push: {
                    messages: {
                      role: "ai",
                      content: streamedContent,
                      searchInfo: searchInfo,
                    },
                  },
                });
                aiMessageSaved = true;
              }
              break;
          }
        } catch (err) {
          await Chat.findByIdAndUpdate(chatId, {
            $pop: { messages: 1 },
          });
          console.error("Error parsing AI chunk:", err, line);
          res.write(
            `data: ${JSON.stringify({ type: "search_error", message: "AI chunk parse error" })}\n\n`
          );

        }
      }
    }

    // 4️⃣ If no AI message saved → rollback user message
    if (!aiMessageSaved) {
      await Chat.findByIdAndUpdate(chatId, {
        $pop: { messages: 1 }, // remove last inserted message (the user one)
      });
    }

    res.end();
  } catch (error) {
    console.error("Error in sendMessage:", error);

    // Rollback user message on failure
    const { chatId } = req.query;
    if (chatId) {
      await Chat.findByIdAndUpdate(chatId, {
        $pop: { messages: 1 },
      });
    }

    res.write(
      `data: ${JSON.stringify({ type: "search_error", message: "Failed to connect to AI" })}\n\n`
    );
    res.end();
  }
};



/**
 * Get all messages in a chat
 */
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Sort messages by messageid (ascending)
    const sortedMessages = [...chat.messages].sort((a, b) => a.messageid - b.messageid);

    res.status(200).json({ messages: sortedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


/**
 * Get user chat list sorted by newest
 */

