import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const RedirectToLatestChat = () => {
  const navigate = useNavigate();
  const { authUser, createChat } = useAuthStore();
  const hasRun = useRef(false); // ✅ prevents duplicate execution

  useEffect(() => {
    const redirectToChat = async () => {
      if (!authUser || hasRun.current) return; // ✅ skip if already handled
      hasRun.current = true;

      let latestChatId = null;

      if (authUser.chats && authUser.chats.length > 0) {
        latestChatId = authUser.chats[0]._id;
      } else {
        try {
          const chat = await createChat(authUser._id);
          console.log("Created chat:", chat);

          if (chat && chat._id) {
            latestChatId = chat._id;
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
    };

    redirectToChat();
  }, [authUser, navigate, createChat]);

  return null;
};

export default RedirectToLatestChat;
