import React from "react";

const PremiumTypingAnimation = () => {
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-1.5">
        <div
          className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full animate-pulse"
          style={{ animationDuration: "1s", animationDelay: "0ms" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full animate-pulse"
          style={{ animationDuration: "1s", animationDelay: "300ms" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full animate-pulse"
          style={{ animationDuration: "1s", animationDelay: "600ms" }}
        ></div>
      </div>
    </div>
  );
};

const SearchStages = ({ searchInfo }) => {
  if (!searchInfo || !searchInfo.stages?.length) return null;

  return (
    <div className="mb-3 mt-1 relative pl-4">
      <div className="flex flex-col space-y-4 text-sm text-foreground">
        {searchInfo.stages.map((stage, index) => {
          const isLast = index === searchInfo.stages.length - 1;

          return (
            <div key={index} className="relative">
              <div className={`absolute -left-3 top-1 w-2.5 h-2.5 rounded-full z-10 shadow-sm ${stage === 'error' ? 'bg-destructive' : 'bg-emerald-main'}`}></div>
              {!isLast && (
                <div className="absolute -left-[7px] top-3 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-emerald-main/70 to-emerald-main/40"></div>
              )}

              <div className="flex flex-col ml-2">
                {stage === 'thinking' && <span className="font-medium">Thinking...</span>}
                {stage === 'checkpoint' && <span className="font-medium text-xs opacity-60">Checkpoint saved</span>}
                
                {stage === 'searching' && (
                  <>
                    <span className="font-medium mb-2">Searching the web</span>
                    {searchInfo.query && <div className="flex flex-wrap gap-2 mt-1">
                      <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                        {searchInfo.query}
                      </div>
                    </div>}
                  </>
                )}

                {stage === 'reading' && searchInfo.urls?.length > 0 && (
                  <>
                    <span className="font-medium mb-2">Reading web results</span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-2">
                        {searchInfo.urls.map((url, i) => (
                          <div key={i} className="bg-card text-xs px-3 py-1.5 rounded border border-border truncate max-w-[200px]">{url}</div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {stage === 'internal_searching' && (
                  <>
                    <span className="font-medium mb-2">Searching internal documents</span>
                    {searchInfo.internalQuery && <div className="flex flex-wrap gap-2 mt-1">
                      <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                        {searchInfo.internalQuery}
                      </div>
                    </div>}
                  </>
                )}

                {stage === 'internal_reading' && searchInfo.internalUrls?.length > 0 && (
                  <>
                    <span className="font-medium mb-2">Reading internal documents</span>
                     <div className="space-y-1">
                      <div className="flex flex-wrap gap-2">
                        {searchInfo.internalUrls.map((url, i) => (
                          <div key={i} className="bg-card text-xs px-3 py-1.5 rounded border border-border truncate max-w-[200px]">{url}</div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {stage === 'rag_searching' && (
                  <>
                    <span className="font-medium mb-2">Searching knowledge base</span>
                    {searchInfo.ragQuery && <div className="flex flex-wrap gap-2 mt-1">
                      <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                        {searchInfo.ragQuery}
                      </div>
                    </div>}
                  </>
                )}

                {stage === 'rag_reading' && searchInfo.ragContext && (
                  <>
                    <span className="font-medium mb-2">Reading knowledge base</span>
                     <div className="space-y-1">
                      <div className="bg-card text-xs px-3 py-1.5 rounded border border-border">
                        <p className="whitespace-pre-wrap font-mono">{searchInfo.ragContext}</p>
                      </div>
                    </div>
                  </>
                )}

                {stage === 'writing' && <span className="font-medium">Writing answer...</span>}
                
                {stage === 'error' && (
                  <>
                    <span className="font-medium text-destructive">Error</span>
                    <div className="text-xs text-destructive mt-1">
                      {searchInfo.error || "An error occurred."}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MessageArea = ({ messages }) => {
  console.log(messages);
  return (
    <div
      className=" bg-background h-full w-full "
      style={{ minHeight: 0 }}
    >
      <div className=" mx-auto p-6">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.role==="user" ? "justify-end" : "justify-start"
            } mb-5`}
          >
            <div className="flex flex-col max-w-[90%] md:max-w-[80%] ">
              {message.role!=="user" && message.searchInfo && (
                <SearchStages searchInfo={message.searchInfo} />
              )}

              <div
                className={`rounded-lg py-3 px-5 ${
                  message.role==="user"
                    ? "bg-sidebar/60  rounded-br-none shadow-md border border-border"
                    : " text-foreground rounded-bl-none shadow-md border border-border"
                }`}
              >
                {message.isLoading ? (
                  <PremiumTypingAnimation />
                ) : (
                  message.content || (
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
    </div>
  );
};

export default MessageArea;
