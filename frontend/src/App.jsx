import OnBoardingPage from "./pages/OnBoardingPage";
import { ThemeProvider } from "./contexts/theme-provider";
import { AuthProvider } from "./contexts/authProvider";
import ProtectedRoute from "./contexts/ProtectedRoute.jsx";
import AuthRedirect from "./contexts/AuthRedirect";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ChatPage from "./pages/ChatPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import Layout from "./contexts/LayoutContext";

function App() {
  const {isCheckingAuth , authUser , checkAuth} = useAuthStore();
  useEffect(()=>{
      
      checkAuth();
  } , [checkAuth])
  if (isCheckingAuth && !authUser){
    return (
    <div className='flex items-center justify-center w-screen h-screen bg-[#121212]'>
      <Loader  className="size-8 animate-spin "/>
    </div>
  )}
  return (
    <Router>

      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Layout>
            <Routes>
              <Route path="/" element={<AuthRedirect />} />

              <Route path="/onboarding" element={<OnBoardingPage />} />

              <Route path="/login" element={!authUser?<LoginPage />:<Navigate to="/chat"/>} />
              <Route path="/signup" element={!authUser?<SignupPage />:<Navigate to="/chat"/>} />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
      </ThemeProvider>
    </Router>
  );
}

export default App;
