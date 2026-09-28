import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// Valeur partagée avec les pages enfants via le contexte de l'Outlet.
// Les pages qui veulent réagir à la recherche appellent
// useOutletContext<DashboardOutletContext>().
export interface DashboardOutletContext {
  searchQuery: string;
}

function DashboardLayout() {
  // La recherche vit ici (layout) car le champ est dans le Header, mais ce
  // sont les pages (ex. Dashboard) qui filtrent leur contenu avec.
  const [searchQuery, setSearchQuery] = useState("");

  // Sur mobile, la sidebar s'ouvre via le bouton menu du Header.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;