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
export const CRMLayout = ({
  children
}) => {
  ;
  const [sidebarOpen,
  setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return ( <div className="flex h-screen bg-background"> {
    /* Sidebar */
  } <CRMSidebar isOpen={
    sidebarOpen
  } onToggle={
    toggleSidebar
  } /> {
    /* Main content area */
  } <div className="flex-1 flex flex-col min-h-screen lg:ml-0"> {
    /* Top header with hamburger menu */
  } <header className="h-14 border-b border-border bg-card shadow-soft lg:hidden">
  <div className="flex items-center justify-between px-4 h-full">
  <Button variant="ghost" size="sm" onClick={
    toggleSidebar
  } className="p-2" >
  <Menu className="w-5 h-5" />
  </Button>
  <span className="text-lg font-semibold text-foreground">
  </span>
  <div className="w-9" /> {
    /* Spacer for centering */
  } </div>
  </header> {
    /* Page content */
  } <main className="flex-1 overflow-auto"> {
    children
  } </main>
  </div>
  </div> );
};
