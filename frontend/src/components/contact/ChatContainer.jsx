import React, { useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import InputMessage from "./InputMessage";
import { Info, MoreHorizontal, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import NoChatContainer from "./NoChatContainer";

const ChatContainer = () => {
    const {
        currentContact,
        getContactMessages,
        sendMessage,
        authUser,
        deleteMessage,
        updateMessageStatus,
        updateLastMessage,
        updateContactLastMessage,
		contacts
    } = useAuthStore();

    const [messages, setMessages] = useState([]);
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentContact?._id) return;
            const data = await getContactMessages(currentContact._id);
            setMessages(data);
        };
        fetchMessages();
    }, [currentContact, contacts]);

    // Mark messages as read
    useEffect(() => {
        if (!messages.length) return;

        const markMessage = async (id) => {
            await updateMessageStatus(id, { delivered: true, read: true });
        };

        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].read === true) break;
            if (messages[i].senderId !== authUser._id)
                markMessage(messages[i]._id);
        }
    }, [messages]);

    // Auto scroll
    useEffect(() => {
        const area = document.querySelector(".message-area");
        if (area) area.scrollTop = area.scrollHeight;
    }, [messages]);

    const deleteMsg = async () => {
        if (!selectedMessageId) return;

        await deleteMessage(selectedMessageId);
        setMessages((prev) => prev.filter((msg) => msg._id !== selectedMessageId));
        setSelectedMessageId(null);
    };

    const send = async (messageContent) => {
        if (!messageContent.trim()) return;

        const messageData = {
            contactId: currentContact._id,
            content: messageContent.trim(),
            senderId: authUser._id,
            receiverId: currentContact.contactUser._id,
        };

        const sentMessage = await sendMessage(messageData);

        // Update backend
        await updateLastMessage(currentContact._id, sentMessage._id);

        // Update Zustand -> triggers ContactList rerender
        updateContactLastMessage(currentContact._id, sentMessage._id);

        setMessages((prev) => [...prev, sentMessage]);
    };

    if (!currentContact) return <NoChatContainer />;

    return (
        <div className="flex flex-col w-2/3">

            {/* Header */}
            <div className="py-3 px-4 flex justify-between items-center border-b-1 border-overlay">
                <div className="flex gap-3 items-center">
                    <img
                        src={currentContact?.contactUser?.profilePic || "/images/user.jpg"}
                        className="size-12 rounded-xl object-cover"
                        alt="User"
                    />

                    <div className="flex flex-col">
                        <div className="font-semibold text-sm sm:text-base">
                            {currentContact?.contactUser.firstName}{" "}
                            {currentContact?.contactUser.lastName}
                        </div>

                        <div className="text-[10px] text-foreground/70">
                            last seen{" "}
                            {new Date(currentContact.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>
                </div>

                {/* Icons */}
                <div className="flex gap-4 items-center">
                    <Trash2
                        className={`size-5 cursor-pointer ${
                            selectedMessageId ? "visible" : "invisible"
                        }`}
                        onClick={deleteMsg}
                    />
                    <Info className="size-5 cursor-pointer" />
                    <MoreHorizontal className="size-5 cursor-pointer" />
                </div>
            </div>

            {/* Messages */}
            <div className="message-area flex-1 overflow-y-auto flex flex-col p-4 gap-2">
                {messages.length === 0 ? (
                    <p className="text-center text-sm opacity-70 mt-4">
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg._id}
                            message={msg}
                            isOwnMessage={msg.senderId === authUser._id}
                            setSelectedMessageId={setSelectedMessageId}
                            selectedMessageId={selectedMessageId}
                        />
                    ))
                )}
            </div>

            <InputMessage onSubmit={send} />
        </div>
    );
};

export default ChatContainer;
