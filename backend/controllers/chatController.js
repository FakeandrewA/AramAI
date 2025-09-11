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
      messages: [
        {
          role: "ai",
          content: "Hi there, how can I help you?",
        },
      ],
    });

    // push chatId to user (at start of list, sorted)
    await User.findByIdAndUpdate(userId, {
      $push: { chats: { $each: [chat._id], $position: 0 } },
    });

    res.status(201).json({
      chatId: chat._id,
      name: chat.name,
      messages: chat.messages,
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
    const { chatId, queryreceived } = req.query;
    if (!chatId || !queryreceived) {
      return res.status(400).json({ message: "chatId and queryreceived required" });
    }

    const query = JSON.parse(queryreceived);
    console.log(query);

    // 1️⃣ Add user message to DB (optimistic insert)
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { role: "user", content: query.query } },
    });

    // 2️⃣ Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let streamedContent = "";
    let searchInfo = null;
    let aiMessageSaved = false;

    // 3️⃣ Call AI API streaming endpoint
    const aiResponse = await fetch(
      `http://localhost:8000/chat_stream/${encodeURIComponent(query.query)}`
    );

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

          if (data.type === "content") {
            streamedContent += data.content;
          } else if (data.type === "search_start") {
            searchInfo = { stages: ["searching"], query: data.query, urls: [] };
          } else if (data.type === "search_results") {
            searchInfo = {
              stages: searchInfo ? [...searchInfo.stages, "reading"] : ["reading"],
              query: searchInfo?.query || "",
              urls: Array.isArray(data.urls) ? data.urls : [],
            };
          } else if (data.type === "end") {
            // Save AI message only if streaming succeeded
            if (streamedContent.trim()) {
              await Chat.findByIdAndUpdate(chatId, {
                $push: {
                  messages: {
                    role: "ai",
                    content: streamedContent,
                    searchInfo: searchInfo || { stages: [], query: "", urls: [] },
                  },
                },
              });
              aiMessageSaved = true;
            }
          }
        } catch (err) {
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

    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

/**
 * Get user chat list sorted by newest
 */

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "chats",
        options: { sort: { createdAt: -1 } }, // sort by most recent
      })
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const chats = (user.chats || []).map((chat) => ({
      chatId: chat._id,
      name: chat.name,
      createdAt: chat.createdAt,
    }));

    res.status(200).json({
      userId: user._id,
      chatCount: chats.length,
      chats,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

