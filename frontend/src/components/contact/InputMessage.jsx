import { ArrowUp, Link as LinkIcon, Paperclip } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const InputMessage = ({ onSubmit }) => {
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() !== "") {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSubmit?.(message.trim()); // send message to parent
    setMessage("");
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        128 // ~4 lines
      )}px`;
    }
  }, [message]);

  return (
    <div className="w-full px-4 py-2">
      <div className="bg-background rounded-xl flex px-4 items-center gap-3 py-2">
        <button className="text-muted-foreground hover:text-foreground">
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-grow text-[14px] px-2 py-2 bg-transparent focus:outline-none resize-none text-foreground placeholder:text-muted-foreground overflow-y-auto"
          style={{ lineHeight: "1.5rem" }}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className=" hover:text-foreground p-2 bg-emerald-500 disabled:opacity-65 rounded-xl hover:scale-105 transition-all duration-150"
        >
          <ArrowUp size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default InputMessage;
