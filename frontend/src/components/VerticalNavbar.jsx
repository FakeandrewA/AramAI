import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, GraduationCap, Menu, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "./mode-toggle";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/theme-provider";

const VerticalNavbar = () => {
  const [collapsed, setCollapsed ] = useState(true);
  const { theme, setTheme } = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const { authUser , setShowMyProfile} = useAuthStore();

  useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);

  // ✅ Collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
   const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setTheme(newTheme);
    setDarkMode(!darkMode);
  };

  const navItems = [
    { name: "Aram AI", path: "/chat", icon: <Bot size={22} /> },
    { name: "Lawyer", path: "/lawyer", icon: <GraduationCap size={22} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={22} /> },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen fixed top-0 left-0 z-50 flex flex-col justify-between overflow-x-hidden overflow-y-auto
                 dark:bg-sidebar/30 bg-sidebar/20 backdrop-blur shadow-lg py-6 px-3 rounded-r-2xl "
    >
      {/* Top Section */}
      <div className="flex flex-col gap-10">
        {/* Logo */}
        <div
          className={`flex flex-row-reverse justify-between items-center  ${
            collapsed ? "px-3" : "px-2"
          }`}
        >
            <div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.h1
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.22 }}
                    className="font-goldman text-2xl font-semibold"
                  >
                    <div className="flex">
                      <div className="size-6 rounded-full bg-foreground"></div>
                      <div className="size-6 rounded-full bg-emerald-500 -ml-3"></div>
                    </div>
                  </motion.h1>
                )}
              </AnimatePresence>
          </div>

          {/* Hide toggle button on mobile */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10 transition hidden md:block"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-3">
          {navItems.map(({ name, path, icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2 rounded-xl relative group
                 transition-all duration-200 text-foreground
                 ${
                   isActive
                     ? "bg-[#494949]/10 dark:bg-[#494949]/30 shadow-md"
                     : "hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10"
                 } ${collapsed ? "justify-center" : ""}`
              }
            >
              {icon}

              {/* Expand name */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.1 }}
                    className="font-light text-foreground"
                  >
                    {name}
                  </motion.span>
                )}
              </AnimatePresence>

              
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4  sapce-y-10 mt-20">
        
        <div className="px-2">
          <ModeToggle/>
          
        </div>
        {/* Profile Section */}
        <button onClick={()=>{setShowMyProfile()}} className="flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10 transition cursor-pointer relative group">
          <img
            src={authUser?.profilePic || "./images/user.jpg"}
            className="w-12 h-12 rounded-full border-2 border-[#10B981]"
            alt="User"
          />

          {/* Expanded view */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-start"
              >
                <p className="font-semibold opacity-80">
                  {authUser?.firstName  || "User"}
                </p>
                <p className="text-sm">View Profile</p>
              </motion.div>
            )}
          </AnimatePresence>

          
        </button>
      </div>
    </motion.div>
  );
};

export default VerticalNavbar;
