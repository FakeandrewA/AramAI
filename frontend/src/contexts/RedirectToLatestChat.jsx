import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const RedirectToLatestChat = () => {
  const navigate = useNavigate();
  const { authUser, createChat } = useAuthStore();

  useEffect(() => {
    if (authUser && authUser.chats) {
      let latestChatId = null;
      if(authUser.chats.length>0){
      latestChatId = authUser.chats[0]._id;
      }
      else{
        const chat = createChat(authUser._id);
        
      // console.log("latest chat: ",chat);
        latestChatId = chat.chatId;
      }
      // console.log("latest: ",latestChatId);
      navigate(`/chat/${latestChatId}`, { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  }, [authUser, navigate]);

  return null; // nothing to render
};

export default RedirectToLatestChat;
