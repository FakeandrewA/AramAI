import { useState } from "react";

const InputBar = ({ currentMessage, setCurrentMessage, onSubmit }) => {
  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 bg-card">
      <div className="flex items-center bg-muted rounded-full p-3 shadow-md border border-border">
        {/* Emoji / Icon button */}
        <button
          type="button"
          className="hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </button>

        {/* Text input */}
        <input
          type="text"
          placeholder="Type a message"
          value={currentMessage}
          onChange={handleChange}
          className="flex-grow px-8 py-2 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
        />

        {/* Attachment / Link button */}
        <button
          type="button"
          className="hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            ></path>
          </svg>
        </button>

        {/* Send button */}
        {/* Send button */}
<button
  type="submit"
  className="bg-[linear-gradient(var(--gradient-accent))] hover:opacity-90 rounded-full p-3 ml-2 shadow-md transition-all duration-200 group"
>
  <svg
    className="w-6 h-6 text-white transform rotate-45 group-hover:scale-110 transition-transform duration-200"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    ></path>
  </svg>
</button>
      </div>
    </form>
  );
};

export default InputBar;
