import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import VerticalNavbar from "../components/VerticalNavbar"; 
import MyProfile from "@/components/modals/MyProfile";

const Layout = ({ children }) => {
  const location = useLocation();
  const { authUser, showMyProfile } = useAuthStore();

  const path = location.pathname;
  const noNavbarPages = ["/login", "/signup", "/onboarding"];
  const showNavbar = !noNavbarPages.includes(path) && authUser;

  return (
    <div className="flex min-h-screen">
      {showNavbar && <VerticalNavbar />}
      {showMyProfile && <MyProfile />}
      
      <div className={`${showNavbar ? "ml-20" : ""} flex-1`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
