import { useAuthStore } from "@/store/useAuthStore";
import { FilePenLine } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatList = ({ chats, onNewChat, userId }) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState(null); // right-click menu
  const { currentChatId, setCurrentChatId, deleteChat, authUser } = useAuthStore();

  const handleNewChat = async () => {
    const chat = await onNewChat(userId);
    if (chat?._id) {
      navigate(`/chat/${chat._id}`);
      setCurrentChatId(chat._id);
    }
  };

  const handleRightClick = (e, chat) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      chatId: chat._id,
    });
  };

  const handleDelete = async (chatId) => {
    await deleteChat(chatId);

    // If deleted chat was active → redirect to latest
    if (chatId === currentChatId) {
      if (authUser.chats.length > 0) {
        const latest = authUser.chats[0]; // chats are sorted newest → oldest
        navigate(`/chat/${latest._id}`);
        setCurrentChatId(latest._id);
      } else {
        navigate("/onboarding");
      }
    }
    setContextMenu(null);
  };

  return (
    <div className="w-full h-fit px-3 flex flex-col relative">
      {/* New Chat Button */}
      <div className="font-medium tracking-wider text-xs opacity-60 mb-4">
        ARAM AI
      </div>
      <div className="w-full p-2 mb-6 hover:bg-muted transition-all duration-100 rounded-lg">
        <button onClick={handleNewChat} className="flex gap-2 items-center">
          <FilePenLine size={16} />
          <p className="text-sm">New Chat</p>
        </button>
      </div>

      {/* Chat List */}
      <div className="w-full flex-1 space-y-2 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-sm text-gray-500">No chats yet. Start a new one!</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => {
                navigate(`/chat/${chat._id}`);
                setCurrentChatId(chat._id);
              }}
              onContextMenu={(e) => handleRightClick(e, chat)}
              className={`w-full text-sm px-2 text-left py-2 dark:hover:bg-muted/40 hover:bg-muted transition-all duration-100 rounded-lg ${
                currentChatId === chat._id ? "bg-foreground/10" : ""
              }`}
            >
              {chat.name || "Untitled Chat"}
            </button>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-md z-50 p-2"
        >
          <button
            className="text-red-500 text-sm w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => handleDelete(contextMenu.chatId)}
          >
            Delete Chat
          </button>
          <button
            className="text-sm w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => setContextMenu(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatList;
