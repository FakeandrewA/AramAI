import React from "react";

const MessageList = ({ messages, currentUserId, onDelete }) => {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => {
        const isMine = msg.senderId === currentUserId;
        return (
          <div
            key={msg._id || msg.timestamp}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm ${
                isMine
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>
              <button
                onClick={() => onDelete(msg._id)}
                className="absolute top-0 right-0 mt-[-8px] mr-[-8px] text-xs text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
