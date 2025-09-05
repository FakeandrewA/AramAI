import { Button } from "@/components/ui/button"
import OnBoardingPage from "./pages/OnBoardingPage"
import { ThemeProvider } from "./lib/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-[100vh] w-[100vw] ">
        <OnBoardingPage/>
      </div>
    </ThemeProvider>
  )
}

export default App