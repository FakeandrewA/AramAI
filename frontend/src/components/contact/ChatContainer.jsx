import React, { useEffect, useState } from 'react'
import MessageBubble from './MessageBubble'
import InputMessage from './InputMessage'
import { Info, MoreHorizontal } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import NoChatContainer from './NoChatContainer';

const ChatContainer = () => {
    const { currentContact, getContactMessages, sendMessage, setcurrentContact, authUser } = useAuthStore();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // console.log("Current Contact changed:", currentContact);
        const fetchMessages = async () => {
            if (!currentContact?._id) return;
            const data = await getContactMessages(currentContact._id);
            setMessages(data);
        }
        fetchMessages();
        
        
    }, [currentContact, getContactMessages, setcurrentContact]);
    if (!currentContact) {
        return (<NoChatContainer />)
    }

    const send = async (messageContent) => {
        // console.log("messageContent:", messageContent);
        console.log("messages :", messages);
        if (!messageContent.trim()) return;
        const messageData = {
            contactId: currentContact._id,
            content: messageContent.trim(),
            senderId: authUser._id,
            receiverId: currentContact.contactUser._id,
        };
        const sentMessage = await sendMessage(messageData);
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
    }
    return (
        <div className="flex flex-col w-2/3">
            {/* Header 💬 */}
            <div className="py-3 px-4 flex justify-between items-center border-b-1  border-overlay">

                <div className="flex gap-3 sm:gap-4 items-center">

                    <img
                    src={currentContact?.contactUser?.profilePic || '/images/user.jpg'}
                    className="size-12 rounded-xl object-cover"
                    draggable={false}
                    alt={'User'}
                />

                    <div className="flex flex-col justify-evenly">
                        <div className="font-semibold text-sm sm:text-base">{currentContact?.contactUser.firstName + " " + currentContact?.contactUser.lastName}</div>
                        <div className="text-[10px] text-foreground/70">last seen {new Date(currentContact.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}</div>
                    </div>
                </div>

                {/* Right Side Icons */}
                <div className="flex gap-4 sm:gap-6 h-full items-center">
                    <Info className="size-5" /> {/* Adjusted icon size */}
                    <MoreHorizontal className="size-5" /> {/* Adjusted icon size */}
                </div>
            </div>

            {/* Message Area 🚀 */}
            <div className="flex-1 w-full overflow-y-auto flex flex-col p-4 gap-2">
                {
                    messages.length === 0 && (
                        <p className="text-center text-sm opacity-70 mt-4">
                            No messages yet. Start the conversation!
                        </p>
                    )
                }
                {
                    messages.map((msg) => (
                        <MessageBubble key={msg._id} message={msg} isOwnMessage={msg.senderId === authUser._id} />
                    ))

                }
            </div>


            {/* Text Input ⌨️ */}
            <div className="w-full">
                <InputMessage onSubmit={send}/>
            </div>
        </div>
    )
}

export default ChatContainer