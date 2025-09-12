import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { PremiumTypingAnimation, SearchStages } from "./SearchStages";

const MessageArea = ({ messages }) => {
  const endRef = useRef();
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);
  if (messages.length == 0) {
    return (
      <div className="bg to-background h-full  w-[95%]  md:w-[90%] lg:w-[85%] xl:w-[75%] 2xl:w-[65%] space-y-6 flex flex-col items-center justify-center">
        <h1 className="font-goldman text-4xl md:text-6xl opacity-80">
          Aram AI
        </h1>
        <p className="opacity-60">
          Start your conversation with AI for legal insights.
        </p>
      </div>
    );
  }
  return (
    <div
      className=" bg-background h-full  w-[95%]  md:w-[90%] lg:w-[85%] xl:w-[75%] 2xl:w-[65%]"
      style={{ minHeight: 0 }}
    >
      <div className=" mx-auto p-6">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } mb-5`}
          >
            <div className="flex flex-col max-w-[90%] md:max-w-[80%] ">
              {message.role !== "user" && message.searchInfo && (
                <SearchStages searchInfo={message.searchInfo} />
              )}

              <div
                className={`rounded-lg py-3 px-5 ${
                  message.role === "user"
                    ? "bg-sidebar/60  rounded-br-none shadow-md border border-border"
                    : " text-foreground rounded-bl-none shadow-md border border-border dark:shadow-white/4 leading-7 opacity-95"
                }`}
              >
                {message.isLoading ? (
                  <PremiumTypingAnimation />
                ) : (
                  (message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )) || (
                    <span className="text-muted-foreground text-xs italic">
                      Waiting for response...
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={endRef} />
    </div>
  );
};

export default MessageArea;