import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const abrirSidebar = () => {
    setSidebarOpen(true);
  };

  const cerrarSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#F5F1EB] text-[#292522]">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={cerrarSidebar}
      />

      <div className="min-w-0 flex-1 flex flex-col">

        <Header onMenuClick={abrirSidebar} />

        <main className="w-full flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;


