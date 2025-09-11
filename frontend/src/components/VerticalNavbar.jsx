import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, GraduationCap, Menu, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "../contexts/theme-provider";
import ChatList from "./chat/ChatList";

const VerticalNavbar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const { theme, setTheme } = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const { authUser, setShowMyProfile, createChat } = useAuthStore();
  const [activePage, setActivePage] = useState("/chat");

  useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);

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
      transition={{ duration: 0.1, ease: "easeInOut" }}
      className="h-full top-0 left-0 z-50 flex flex-col justify-between
                 dark:bg-sidebar/30 bg-sidebar/60 backdrop-blur shadow-lg  px-3 
                 rounded-r-2xl fixed md:relative"
    >
      {/* Top Section */}
      <div className="flex flex-col gap-10 py-6">
        {/* Logo + Collapse toggle */}
        <div className={`flex flex-row-reverse justify-between items-center ${collapsed ? "px-3" : "px-2"}`}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.1 }} className="font-goldman text-xl font-medium">
                Aram AI
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10 transition "
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
              onClick={() => {
                setActivePage(path);
              }}
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

      {/* Middle Section (fills space) */}
      <div className="flex-1 overflow-y-auto mt-4 mb-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="chatlist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.06  }}
              className="w-full flex-1"
            >
              {activePage === "/chat" &&
              
                <ChatList
                  chats={authUser?.chats || []}
                  onNewChat={createChat}
                  userId={authUser?._id}
                />
              }
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 py-4">
        <div className="px-2">
          <ModeToggle />
        </div>

        <button
          onClick={() => {
            setShowMyProfile();
          }}
          className="flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-[#494949]/5 dark:hover:bg-[#494949]/10 transition cursor-pointer"
        >
          <img
            src={authUser?.profilePic || "./images/user.jpg"}
            className="w-12 h-12 rounded-full border-2 border-[#10B981]"
            alt="User"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.1 }}
                className="flex flex-col items-start"
              >
                <p className="font-semibold opacity-80">
                  {authUser?.firstName || "User"}
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
