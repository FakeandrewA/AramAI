
import { useAuthStore } from "@/store/useAuthStore";
import { FilePenLine } from "lucide-react";
import React, { useState } from "react";
import { useNavigate , useParams } from "react-router-dom";

const ChatList = ({ chats, onNewChat, userId }) => {

  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState(chats[0]._id);
  const { currentChatId } = useAuthStore();
  const handleNewChat = async () => {
    const chat = await onNewChat(userId);
    console.log(chat);
    if (chat?._id) {
      navigate(`/chat/${chat._id}`);
    }
  };

  return (
    <div className="w-full h-fit px-3 flex flex-col ">
      {/* New Chat Button */}
      <div className="font-medium tracking-wider  text-xs opacity-60 mb-4">
        ARAM AI
      </div>
      <div className="w-full p-2 mb-6 hover:bg-muted transition-all duration-100 rounded-lg">
        <button
          onClick={handleNewChat}
          className="flex gap-2 items-center"
        >   
          <FilePenLine size={16}/>
          <p className="text-sm">New Chat</p>
          
        </button>
      </div>

      {/* Chat List */}
      <div className="w-full flex-1 space-y-2 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-sm text-gray-500">No chats yet. Start a new one!</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={()=> {navigate(`/chat/${chat._id}`)}}
              className={`w-full text-sm px-2 text-left py-2 dark:hover:bg-muted/40 hover:bg-muted transition-all duration-100 rounded-lg ${currentChatId === chat._id ? "bg-foreground/10":""}`}
            >
              {chat.name || "Untitled Chat"}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
