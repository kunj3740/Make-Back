import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Folder, LogOut, Sparkles, FolderOpen } from "lucide-react";

export default function AppBar() {
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate(); // ✅ for redirecting after logout

  useEffect(() => {
    const token = localStorage?.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        username: payload.username || payload.user || payload.name || "User",
        email: payload.email || "",
      });
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage?.removeItem("token");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    localStorage?.removeItem("token");
    setUser(null);
    navigate("/signin", { replace: true }); // ✅ redirect to login page
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#090514]/80 backdrop-blur-xl border-b border-purple-900/30 shadow-lg shadow-[#090514]/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200" style={{ background: "linear-gradient(to bottom right, #6b21a8, #581c87)", boxShadow: "0 4px 14px rgba(88, 28, 135, 0.4)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Make-Back
            </span>
          </Link>

          {/* Navigation and User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* My Projects - Desktop */}
                <nav className="hidden md:flex items-center">
                  <Link
                    to="/projects"
                    className="group relative flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50"
                  >
                    <div className="relative">
                      <Folder className="w-4 h-4 group-hover:opacity-0 transition-opacity duration-200" />
                      <FolderOpen className="w-4 h-4 absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: "#6b21a8" }} />
                    </div>
                    <span className="font-medium">My Projects</span>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" style={{ background: "linear-gradient(to right, #6b21a8, #581c87)" }}></div>
                  </Link>
                </nav>

                {/* My Projects - Mobile */}
                <div className="md:hidden">
                  <Link
                    to="/projects"
                    className="p-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-800/30"
                  >
                    <Folder className="w-5 h-5" />
                  </Link>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-purple-500/30 transition-all duration-200">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white font-semibold text-sm">
                          {getUserInitial()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 mt-2 bg-[#090514]/95 backdrop-blur-xl border border-purple-900/30 shadow-xl"
                    align="end"
                  >
                    <div className="px-3 py-2 border-b border-gray-700/50">
                      <p className="text-sm font-medium text-white">
                        {user.username}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer m-1 rounded"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Log In Button
              <Link to="/signin">
                <Button className="text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 shadow-lg" style={{ background: "linear-gradient(to right, #6b21a8, #581c87)", boxShadow: "0 4px 14px rgba(88, 28, 135, 0.3)" }} onMouseOver={(e) => e.currentTarget.style.background = "linear-gradient(to right, #581c87, #4c1d95)"} onMouseOut={(e) => e.currentTarget.style.background = "linear-gradient(to right, #6b21a8, #581c87)"}>
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
