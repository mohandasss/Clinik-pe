import { Outlet } from "react-router-dom";
import SideBar from "./Components/SideBar";
import Header from "./Components/Header";
import { useState } from "react";

export default function AppLayout() {
  const [isSmall, setIsSmall] = useState(false);
  return (
    <div className="flex min-h-screen">
      {/* ✅ Left Sidebar */}
      <SideBar isSmall={isSmall} setIsSmall={setIsSmall} />

      {/* ✅ Right content area */}
      <div className="flex flex-col flex-1 h-screen">
        <Header isSmall={isSmall} setIsSmall={setIsSmall} />

        {/* ✅ Main page content */}
        <main className="flex-1 bg-blue-50/50 py-4 px-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
