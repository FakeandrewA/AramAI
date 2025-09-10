import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import { generateChatName } from "../utils.js";

/**
 * Create a new chat with a default welcome message
 */
export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    // create chat with default AI message
    const chat = await Chat.create({
      user: userId,
      name: generateChatName(),
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
    const { chatId, query } = req.body;

    // add user message first
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { role: "user", content: query } },
    });

    // set headers for SSE (stream)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let streamedContent = "";
    let searchInfo = null;

    // call your AI API that streams events
    const eventSource = fetch(
      `https://perplexity-api.onrender.com/chat_stream/${encodeURIComponent(
        query
      )}`
    );

    const response = await eventSource;

    if (!response.body) {
      throw new Error("No response body from AI service");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      try {
        const data = JSON.parse(chunk);

        // forward event to frontend immediately
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
          // save final AI message in DB
          await Chat.findByIdAndUpdate(chatId, {
            $push: {
              messages: {
                role: "ai",
                content: streamedContent,
                searchInfo: searchInfo || { stages: [], query: "", urls: [] },
              },
            },
          });
        }
      } catch (err) {
        console.error("Error parsing AI event:", err);

        // rollback: remove the user query if AI failed
        await Chat.findByIdAndUpdate(chatId, {
          $pull: { messages: { role: "user", content: query } },
        });

        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: "AI response error",
          })}\n\n`
        );
        break;
      }
    }

    res.end();
  } catch (error) {
    console.error("Error in sendMessage:", error);

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Failed to connect to AI",
      })}\n\n`
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

    const user = await User.findById(userId).populate({
      path: "chats",
      options: { sort: { createdAt: -1 } }, // sorted
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      chats: user.chats.map((chat) => ({
        chatId: chat._id,
        name: chat.name,
        createdAt: chat.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};
