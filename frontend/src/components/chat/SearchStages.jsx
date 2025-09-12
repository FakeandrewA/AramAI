import { ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

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
  const [hideStages, setHideStages] = useState(false);
  console.log(searchInfo);

  return (
    <div className="relative">
      <button
        className={`absolute -top-3 right-0 flex items-center justify-center z-50 p-2 rounded ${
          hideStages ? "rotate-180" : "rotate-0"
        }`}
        onClick={() => {
          setHideStages(!hideStages);
        }}
      >
        <ChevronUp className={`size-4 `} />
      </button>
      <motion.div
        initial={{ maxHeight: 0, opacity: 0 }}
        animate={{
          maxHeight: hideStages ? 0 : 500,
          opacity: hideStages ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="mb-3 mt-1 relative pl-4 overflow-hidden"
      >
        <div className="flex flex-col space-y-4 text-sm text-foreground">
          {searchInfo.stages.map((stage, index) => {
            const isLast = index === searchInfo.stages.length - 1;

            return (
              <div key={index} className="relative ">
                <div
                  className={`absolute -left-3 top-1 w-2.5 h-2.5 rounded-full z-10 shadow-sm ${
                    stage === "error" ? "bg-destructive" : "bg-emerald-main"
                  }`}
                ></div>
                {!isLast && (
                  <div className="absolute -left-[7px] top-3 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-emerald-main/70 to-emerald-main/40"></div>
                )}

                <div className="flex flex-col ml-2 ">
                  {stage === "thinking" && (
                    <span
                      className={`font-medium ${
                        stage !== "thinking" ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      Thinking...
                    </span>
                  )}
                  {stage === "checkpoint" && (
                    <span className="font-medium text-xs opacity-60">
                      Checkpoint saved
                    </span>
                  )}

                  {stage === "searching" && (
                    <>
                      <span className="font-medium mb-2">
                        Searching the web
                      </span>
                      {searchInfo.query && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                            {searchInfo.query}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {stage === "reading" && searchInfo.urls?.length > 0 && (
                    <>
                      <span className="font-medium mb-2">
                        Reading web results
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2">
                          {searchInfo.urls.map((url, i) => (
                            <a
                              target="_blank"
                              href={url}
                              key={i}
                              className="text-[#20b958]  hover:underline bg-card text-xs px-3 py-1.5 rounded border border-border truncate max-w-[200px]"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {stage === "internal_searching" && (
                    <>
                      <span className="font-medium mb-2">
                        Searching internal documents
                      </span>
                      {searchInfo.internalQuery && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                            {searchInfo.internalQuery}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {stage === "internal_reading" &&
                    searchInfo.internalUrls?.length > 0 && (
                      <>
                        <span className="font-medium mb-2">
                          Reading internal documents
                        </span>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-2">
                            {searchInfo.internalUrls.map((url, i) => (
                              <div
                                key={i}
                                className="bg-card text-xs px-3 py-1.5 rounded border border-border truncate max-w-[200px]"
                              >
                                {url}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  {stage === "rag_searching" && (
                    <>
                      <span className="font-medium mb-2">
                        Searching knowledge base
                      </span>
                      {searchInfo.ragQuery && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <div className="bg-card text-xs px-3 py-1.5 rounded border border-border inline-flex items-center shadow-sm">
                            {searchInfo.ragQuery}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {stage === "rag_reading" && searchInfo.ragContext && (
                    <>
                      <span className="font-medium mb-2">
                        Reading knowledge base
                      </span>
                      <div className="space-y-1">
                        <div className="bg-card text-xs px-3 py-1.5 rounded border border-border">
                          <p className="whitespace-pre-wrap font-mono">
                            {searchInfo.ragContext}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {stage === "writing" && (
                    <span className="font-medium">Writing answer...</span>
                  )}

                  {stage === "error" && (
                    <>
                      <span className="font-medium text-destructive">
                        Error
                      </span>
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
      </motion.div>
    </div>
  );
};

export { PremiumTypingAnimation, SearchStages };
