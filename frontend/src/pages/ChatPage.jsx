import ChatList from "@/components/chat/ChatList";
import Header from "../components/chat/Header";
import InputBar from "@/components/chat/InputBar";
import MessageArea from "@/components/chat/MessageArea";
import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const ChatPage = () => {

    const { authUser, getMessages, createChat } = useAuthStore();
    const chats = authUser.chats;
    const [messages, setMessages] = useState([]);
    let { chatId } = useParams();
    if (chatId == null) {
        return <Navigate to='/onBoarding' />;
    }
    // console.log("Current chat id:", chatId);
    useEffect(() => {
        // console.log("chatId", chatId);
        const fetchMessages = async () => {
            try {
                const msgs = await getMessages(chatId);
                setMessages(msgs.messages);
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };

        if (chatId) fetchMessages();
    }, [chatId]);


    const [currentMessage, setCurrentMessage] = useState("");
    const [checkpointId, setCheckpointId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentMessage.trim()) {
            const newMessageId =
                messages.length > 0 ? Math.max(...messages.map((msg) => msg.id)) + 1 : 1;

            setMessages((prev) => [
                ...prev,
                {
                    id: newMessageId,
                    content: currentMessage,
                    isUser: true,
                    type: "message",
                },
            ]);

            const userInput = currentMessage;
            setCurrentMessage("");

            try {
                const aiResponseId = newMessageId + 1;
                setMessages((prev) => [
                    ...prev,
                    {

                        id: aiResponseId,
                        content: "",
                        isUser: false,
                        type: "message",
                        isLoading: true,
                        searchInfo: {
                            stages: [],
                            query: "",
                            urls: [],
                        },
                    },
                ]);
                const message = {
                    userId: authUser._id,
                    chatId: chatId,
                    query: userInput,
                    messageId: aiResponseId
                };
                let url = `http://localhost:5000/api/chats/send?chatId=${chatId}&query=${encodeURIComponent(message)}`;
                if (checkpointId) {
                    url += `&checkpoint_id=${encodeURIComponent(checkpointId)}`;
                }

                const eventSource = new EventSource(url);
                let streamedContent = "";
                let searchData = null;
                let hasReceivedContent = false;

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.type === "checkpoint") {
                            setCheckpointId(data.checkpoint_id);
                        } else if (data.type === "content") {
                            streamedContent += data.content;
                            hasReceivedContent = true;

                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === aiResponseId
                                        ? { ...msg, content: streamedContent, isLoading: false }
                                        : msg
                                )
                            );
                        } else if (data.type === "search_start") {
                            const newSearchInfo = {
                                stages: ["searching"],
                                query: data.query,
                                urls: [],
                            };
                            searchData = newSearchInfo;

                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === aiResponseId
                                        ? {
                                            ...msg,
                                            content: streamedContent,
                                            searchInfo: newSearchInfo,
                                            isLoading: false,
                                        }
                                        : msg
                                )
                            );
                        } else if (data.type === "search_results") {
                            try {
                                const urls =
                                    typeof data.urls === "string" ? JSON.parse(data.urls) : data.urls;

                                const newSearchInfo = {
                                    stages: searchData
                                        ? [...searchData.stages, "reading"]
                                        : ["reading"],
                                    query: searchData?.query || "",
                                    urls: urls,
                                };
                                searchData = newSearchInfo;

                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === aiResponseId
                                            ? {
                                                ...msg,
                                                content: streamedContent,
                                                searchInfo: newSearchInfo,
                                                isLoading: false,
                                            }
                                            : msg
                                    )
                                );
                            } catch (err) {
                                console.error("Error parsing search results:", err);
                            }
                        } else if (data.type === "search_error") {
                            const newSearchInfo = {
                                stages: searchData ? [...searchData.stages, "error"] : ["error"],
                                query: searchData?.query || "",
                                error: data.error,
                                urls: [],
                            };
                            searchData = newSearchInfo;

                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === aiResponseId
                                        ? {
                                            ...msg,
                                            content: streamedContent,
                                            searchInfo: newSearchInfo,
                                            isLoading: false,
                                        }
                                        : msg
                                )
                            );
                        } else if (data.type === "end") {
                            if (searchData) {
                                const finalSearchInfo = {
                                    ...searchData,
                                    stages: [...searchData.stages, "writing"],
                                };

                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === aiResponseId
                                            ? { ...msg, searchInfo: finalSearchInfo, isLoading: false }
                                            : msg
                                    )
                                );
                            }

                            eventSource.close();
                        }
                    } catch (error) {
                        console.error("Error parsing event data:", error, event.data);
                    }
                };

                eventSource.onerror = (error) => {
                    console.error("EventSource error:", error);
                    eventSource.close();

                    if (!streamedContent) {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === aiResponseId
                                    ? {
                                        ...msg,
                                        content:
                                            "Sorry, there was an error processing your request.",
                                        isLoading: false,
                                    }
                                    : msg
                            )
                        );
                    }
                };

                eventSource.addEventListener("end", () => {
                    eventSource.close();
                });
            } catch (error) {
                console.error("Error setting up EventSource:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: newMessageId + 1,
                        content: "Sorry, there was an error connecting to the server.",
                        isUser: false,
                        type: "message",
                        isLoading: false,
                    },
                ]);
            }
        }
    };




    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Top Header */}
            <Header />

            {/* Main content area (below header) */}
            <div className="flex flex-1">
                {/* Left side: messages + input */}
                <div className="flex-1 flex flex-col bg-[var(--gradient-primary)] shadow-lg border-r border-border">
                    <MessageArea messages={messages}/>
                    <InputBar
                        currentMessage={currentMessage}
                        setCurrentMessage={setCurrentMessage}
                        onSubmit={handleSubmit}
                    />
                </div>

                {/* Right side: chat list */}
                <div className="w-72 border-l border-border">
                    <ChatList
                        chats={authUser.chats}
                        onNewChat={createChat}
                        userId={authUser._id}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
