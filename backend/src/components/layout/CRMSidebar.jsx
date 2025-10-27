import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Activity,
  Users,
  TrendingUp,
  ClipboardList,
  Package,
  BarChart3,
  Building2,
  HandHeart,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  FileText,
  ShoppingCart,
  CalendarCheck,
  Mail,
  CheckSquare,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

const menuItems = [
  {
    name: "Home",
    icon: Home,
    path: "/"
  },
  {
    name: "Calendar",
    icon: Calendar,
    path: "/calendar"
  },
  {
    name: "Customers",
    icon: Users,
    children: [
      {
        name: "Accounts",
        icon: Building2,
        path: "/customers/accounts"
      },
      {
        name: "Contacts",
        icon: Users,
        path: "/customers/contacts"
      }
    ]
  },
  {
    name: "Sales",
    icon: TrendingUp,
    children: [
      {
        name: "Leads",
        icon: HandHeart,
        path: "/sales/leads"
      },
      {
        name: "Opportunities",
        icon: BarChart3,
        path: "/sales/opportunities"
      },
      {
        name: "Sales Quotes",
        icon: FileText,
        path: "/sales/quotes"
      },
      {
        name: "Sales Orders",
        icon: ShoppingCart,
        path: "/sales/orders"
      }
    ]
  },
  {
    name: "Activities",
    icon: Activity,
    children: [
      {
        name: "Appointments",
        icon: CalendarCheck,
            path: "/activities/appointments"
      },
      {
        name: "E-Mails",
        icon: Mail,
        path: "/activities/emails"
      },
      {
        name: "Tasks",
        icon: CheckSquare,
        path: "/activities/tasks"
      }
    ]
  },
  {
    name: "Visits",
    icon: Navigation,
    children: [
      {
        name: "Visit List",
        icon: MapPin,
        path: "/visits/list"
      }
    ]
  },
  {
    name: "Products",
    icon: Package,
    children: [
      {
        name: "Inventory",
        icon: ClipboardList,
        path: "/products/inventory"
      }
    ]
  },
  
];

const CRMSidebar = ({ isOpen, onToggle }) => {
  const [openMenus, setOpenMenus] = useState([]);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuOpen = (menuName) => openMenus.includes(menuName);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onToggle} 
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-sidebar-bg border-r border-sidebar-border z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-64 shadow-medium"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">CRM System</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              !item.children ? (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors",
                    "hover:bg-sidebar-hover text-sidebar-foreground",
                    isActive && "bg-primary text-primary-foreground font-medium shadow-sm"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ) : (
                <Collapsible
                  key={item.name}
                  open={isMenuOpen(item.name)}
                  onOpenChange={() => toggleMenu(item.name)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left font-normal h-9",
                        "hover:bg-sidebar-hover text-sidebar-foreground",
                        isMenuOpen(item.name) && "bg-sidebar-active text-primary font-medium"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {isMenuOpen(item.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-4 mt-1">
                    {item.children?.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.path || "#"}
                        className={({ isActive }) => cn(
                          "flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors",
                          "hover:bg-sidebar-hover text-sidebar-foreground",
                          isActive && "bg-primary text-primary-foreground font-medium shadow-sm"
                        )}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.name}</span>
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default CRMSidebar;