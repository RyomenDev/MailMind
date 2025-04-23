
import { Search, RefreshCw, Bell, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useEmails } from "../../contexts/EmailContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { refreshEmails, isLoading, filter, setFilter } = useEmails();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(filter.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ ...filter, search: searchQuery });
  };

  const handleRefresh = () => {
    refreshEmails();
  };

  return (
    <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center w-full max-w-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search emails..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {user && (
            <div className="flex items-center">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                <Button
                  variant="link"
                  className="text-xs p-0 h-auto"
                  onClick={logout}
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
