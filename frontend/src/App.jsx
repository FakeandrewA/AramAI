import OnBoardingPage from "./pages/OnBoardingPage";
import { ThemeProvider } from "./contexts/theme-provider";
import { AuthProvider } from "./contexts/authProvider";
import ProtectedRoute from "./contexts/ProtectedRoute.jsx";
import AuthRedirect from "./contexts/AuthRedirect";
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
