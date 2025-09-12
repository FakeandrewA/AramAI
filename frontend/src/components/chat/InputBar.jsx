import { ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const InputBar = ({ currentMessage, setCurrentMessage, onSubmit }) => {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`; // max 4 rows ~128px
    }
  }, [currentMessage]);

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 z-90  w-[95%]  md:w-[90%] lg:w-[85%] xl:w-[75%] 2xl:w-[65%] "
    >
      <div className="flex items-end bg-sidebar/60 rounded-xl p-2 shadow-md w-full">
        <textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={currentMessage}
          onChange={handleChange}
          rows={1}
          className="flex-grow px-4 py-2 bg-transparent focus:outline-none resize-none text-foreground placeholder:text-muted-foreground overflow-y-auto"
          style={{ lineHeight: "1.5rem" }}
        />

        <button
          type="submit"
          className="bg-[linear-gradient(var(--gradient-accent))] hover:opacity-90 rounded-xl p-2 ml-2 shadow-md transition-all duration-200 group"
        >
          <ArrowUp className="group-hover:scale-105 text-white transition-all duration-150" />
        </button>
      </div>
    </form>
  );
};

export default InputBar;
