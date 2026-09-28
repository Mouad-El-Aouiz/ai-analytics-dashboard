import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// Seules les routes réellement déclarées dans App.tsx sont listées ici.
const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Insights",
    path: "/ai-insights",
    icon: Sparkles,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
];

interface SidebarProps {
  // Sur mobile, la sidebar est un panneau qui s'ouvre / se ferme.
  // Sur desktop (lg+), elle est toujours visible.
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile : assombrit le contenu et ferme au clic. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              ✦
            </div>

            <span className="text-lg font-semibold">
              AI Analytics
            </span>
          </div>

          {/* Bouton fermer, mobile uniquement */}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-200 p-4">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;