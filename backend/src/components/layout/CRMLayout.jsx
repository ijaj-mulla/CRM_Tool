import React,
{
  useState
} from "react";
import CRMSidebar from "./CRMSidebar";
import {
  Button
} from "@/components/ui/button";
import {
  Menu
} from "lucide-react";
import {
  cn
} from "@/lib/utils";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
import { useLocation } from "react-router-dom";
export const CRMLayout = ({
  children
}) => {
  ;
  const [sidebarOpen,
  setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const location = useLocation();
  const path = location.pathname || "/";
  const titleMap = {
    "/": "Dashboard",
    "/calendar": "Calendar",
    "/customers/accounts": "Accounts",
    "/customers/contacts": "Contacts",
    "/sales/leads": "Leads",
    "/sales/opportunities": "Opportunities",
    "/sales/quotes": "Sales Quotes",
    "/sales/orders": "Sales Orders",
    "/sales/appointments": "Appointments",
    "/activities/appointments": "Appointments",
    "/activities/tasks": "Tasks",
  };
  const currentTitle = titleMap[path] || "";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <CRMSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 ml-0 pt-16 overflow-hidden min-h-screen">
        {/* Fixed global header */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-40 bg-card border-b border-border shadow-soft flex items-center justify-center px-2 sm:px-0.5">
          <div className="w-full max-w-8xl">
            <CRMToolbar
              title={currentTitle}
              className="h-14 bg-card border border-border shadow-soft rounded-lg px-4"
              leadingContent={
                <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-2 lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              }
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto hide-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
