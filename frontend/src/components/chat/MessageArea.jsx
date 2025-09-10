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
        {/* Searching Stage */}
        {searchInfo.stages.includes("searching") && (
          <div className="relative">
            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-emerald-main rounded-full z-10 shadow-sm"></div>

            {searchInfo.stages.includes("reading") && (
              <div className="absolute -left-[7px] top-3 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-emerald-main/70 to-emerald-main/40"></div>
            )}

            <div className="flex flex-col">
              <span className="font-medium mb-2 ml-2">Searching the web</span>

              <div className="flex flex-wrap gap-2 pl-2 mt-1">
                <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                  <svg
                    className="w-3 h-3 mr-1.5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                  {searchInfo.query}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reading Stage */}
        {searchInfo.stages.includes("reading") && (
          <div className="relative">
            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-emerald-main rounded-full z-10 shadow-sm"></div>

            <div className="flex flex-col">
              <span className="font-medium mb-2 ml-2">Reading</span>

              {searchInfo.urls?.length > 0 && (
                <div className="pl-2 space-y-1">
                  <div className="flex flex-wrap gap-2">
                    {searchInfo.urls.map((url, index) => (
                      <div
                        key={index}
                        className="bg-card text-xs px-3 py-1.5 rounded border border-border truncate max-w-[200px] transition-all duration-200 hover:bg-muted"
                      >
                        {typeof url === "string"
                          ? url
                          : JSON.stringify(url).substring(0, 30)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Writing Stage */}
        {searchInfo.stages.includes("writing") && (
          <div className="relative">
            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-emerald-main rounded-full z-10 shadow-sm"></div>
            <span className="font-medium pl-2">Writing answer</span>
          </div>
        )}

        {/* Error Stage */}
        {searchInfo.stages.includes("error") && (
          <div className="relative">
            <div className="absolute -left-3 top-1 w-2.5 h-2.5 bg-destructive rounded-full z-10 shadow-sm"></div>
            <span className="font-medium">Search error</span>
            <div className="pl-4 text-xs text-destructive mt-1">
              {searchInfo.error || "An error occurred during search."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageArea = ({ messages }) => {
  console.log(messages);
  return (
    <div
      className="flex-grow overflow-y-auto bg-background border-b border-border"
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
            <div className="flex flex-col max-w-[75%]">
              {message.role!=="user" && message.searchInfo && (
                <SearchStages searchInfo={message.searchInfo} />
              )}

              <div
                className={`rounded-lg py-3 px-5 ${
                  message.role==="user"
                    ? "bg-[linear-gradient(var(--chat-gradient))] text-[var(--clr-text-inverse)] rounded-br-none shadow-md"
                    : "bg-card text-foreground border border-border rounded-bl-none shadow-sm"
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
