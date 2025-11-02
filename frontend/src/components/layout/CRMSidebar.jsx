import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Navigation,
  Briefcase,
  Truck
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
    name: "Competitors",
    icon: Briefcase,
    path: "/customers/competitors"
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
    name: "Products",
    icon: Package,
    path: "/products/products"
  },
  {
    name: "Suppliers",
    icon: Truck,
    children: [
      {
        name: "Suppliers",
        icon: Building2,
        path: "/suppliers/suppliers"
      },
      {
        name: "Supplier Contacts",
        icon: Users,
        path: "/suppliers/contacts"
      }
    ]
  },

  // {
  //   name: "Visits",
  //   icon: Navigation,
  //   children: [
  //     {
  //       name: "Visit List",
  //       icon: MapPin,
  //       path: "/visits/list"
  //     }
  //   ]
  // },
];

const CRMSidebar = ({ isOpen, onToggle }) => {
  const [openMenus, setOpenMenus] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-open parent menus based on current route
  useEffect(() => {
    const toOpen = [];
    menuItems.forEach((item) => {
      if (item.children && item.children.some((c) => location.pathname.startsWith(c.path))) {
        toOpen.push(item.name);
      }
    });
    setOpenMenus(toOpen);
  }, [location.pathname]);

  const handleNavigate = (targetPath) => {
    const isSamePath = location.pathname === targetPath;
    if (isSamePath) {
      navigate(`${targetPath}?refresh=${Date.now()}`, { replace: true });
    } else {
      navigate(targetPath);
    }
  };

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border bg-gradient-to-r from-card/60 to-transparent">
          <div className="flex items-center gap-3">
            <img src="/logo-crm.svg" alt="CRM" className="h-7 w-7 rounded-md shadow-sm ring-1 ring-white/10" />
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight text-sidebar-foreground">CRM System</div>
              <div className="text-xs text-muted-foreground">Manage Connections</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
            aria-label="Close sidebar"
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
                    (isActive || location.pathname.startsWith(item.path)) && "bg-primary text-primary-foreground font-medium shadow-sm"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(item.path);
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
                  onOpenChange={(open) => {
                    setOpenMenus((prev) => open ? Array.from(new Set([...prev, item.name])) : prev.filter((n) => n !== item.name));
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left font-normal h-9",
                        "hover:bg-sidebar-hover text-sidebar-foreground",
                        (isMenuOpen(item.name) || item.children.some((c) => location.pathname.startsWith(c.path))) && "bg-sidebar-active text-primary font-medium"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        // Always open the menu and navigate to its primary child list
                        const defaultChild = item.children[0];
                        setOpenMenus((prev) => Array.from(new Set([...prev, item.name])));
                        if (defaultChild?.path) {
                          handleNavigate(defaultChild.path);
                        }
                      }}
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
                          (isActive || (child.path && location.pathname.startsWith(child.path))) && "bg-primary text-primary-foreground font-medium shadow-sm"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          if (child.path) {
                            handleNavigate(child.path);
                          }
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