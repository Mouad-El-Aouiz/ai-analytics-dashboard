import { Bell, Menu, Search, X } from "lucide-react";
import { signOut } from "../services/authService";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { getFullName, getInitials } from "../utils/userUtils";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  // Ouvre la sidebar sur mobile (le layout gère l'état).
  onOpenSidebar: () => void;
}

function Header({
  searchQuery,
  onSearchChange,
  onOpenSidebar,
}: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fullName = getFullName(
    user?.user_metadata?.full_name
  );

  const initials = getInitials(
    user?.user_metadata?.full_name
  );

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Menu button (mobile only) + Search */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex w-full max-w-96 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Search size={18} className="shrink-0 text-gray-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search orders by customer, ID or status..."
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="shrink-0 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <button
          type="button"
          className="relative text-gray-500 hover:text-gray-900"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {fullName}
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 sm:block"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;