import React from "react";

const ChatList = ({ chats, onNewChat, onSelectChat }) => {
  return (
    <div className="w-full bg-background border-r border-border flex flex-col">
      {/* New Chat Button */}
      <div className="w-full p-2 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full bg-primary text-white rounded-lg py-2 font-semibold hover:bg-primary/90 transition"
        >
          + New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="w-full flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No chats yet. Start a new one!</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className="w-full text-left px-4 py-2 hover:bg-muted transition border-b border-border"
            >
              {chat.name || "Untitled Chat"}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
