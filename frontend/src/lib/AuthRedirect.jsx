import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authProvider";

function AuthRedirect() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat", { replace: true });   // if logged in → chat
    } else {
      navigate("/onBoarding", { replace: true });       // if not logged in → onboarding
    }
  }, [isAuthenticated, navigate]);

  return null; // nothing to render, just redirects
}

export default AuthRedirect;
