import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const RedirectToLatestChat = () => {
  const navigate = useNavigate();
  const { authUser, createChat } = useAuthStore();

  useEffect(() => {
    const redirectToChat = async () => {
      if (authUser && authUser.chats) {
        let latestChatId = null;
        if (authUser.chats.length > 0) {
          latestChatId = authUser.chats[0]._id;
        } else {
          try {
            const chat = await createChat(authUser._id);
            if (chat && chat.chatId) {
              latestChatId = chat.chatId;
            } else {
              navigate("/onboarding", { replace: true });
              return;
            }
          } catch (error) {
            console.error("Failed to create initial chat:", error);
            navigate("/onboarding", { replace: true });
            return;
          }
        }
        if (latestChatId) {
          navigate(`/chat/${latestChatId}`, { replace: true });
        }
      } else if (authUser) {
        // If authUser exists but chats are not yet populated, this effect will re-run when they are.
        // If they don't exist at all, it's safer to redirect.
        navigate("/onboarding", { replace: true });
      }
    };

    redirectToChat();
  }, [authUser, navigate, createChat]);

  return null; // nothing to render
};

export default RedirectToLatestChat;
