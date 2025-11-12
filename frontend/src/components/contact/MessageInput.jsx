import React, { useState } from "react";

const MessageInput = ({ onSend, onTyping }) => {
  const [text, setText] = useState("");

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.(true);

    // stop typing after 1s idle
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => onTyping?.(false), 1000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    onSend(text);
    setText("");
    onTyping?.(false);
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex items-center border-t bg-white px-3 py-2"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
        className="flex-1 outline-none text-sm p-2 rounded-full border border-gray-300"
      />
      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
