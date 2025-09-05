import OnBoardingPage from "./pages/OnBoardingPage";
import { ThemeProvider } from "./lib/theme-provider";
import { AuthProvider } from "./lib/authProvider";
import ProtectedRoute from "./lib/ProtectedRoute.jsx";
import AuthRedirect from "./lib/AuthRedirect";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />

            <Route path="/onboarding" element={<OnBoardingPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
