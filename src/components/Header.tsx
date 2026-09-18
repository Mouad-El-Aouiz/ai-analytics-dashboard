import { Bell, Search } from "lucide-react";
import { signOut } from "../services/authService";

import { useAuth } from "../context/useAuth";
import { getFullName, getInitials } from "../utils/userUtils";

function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
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
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="flex w-96 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        <button className="relative text-gray-500 hover:text-gray-900">
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
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;