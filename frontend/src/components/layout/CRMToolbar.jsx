import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, PieChart, Filter, Plus, RotateCcw, MoreHorizontal, Columns } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { API_PREFIX } from "@/config/api";

const defaultActions = [ {
  icon: ArrowUpDown,
  label: "Sort"
},
{
  icon: PieChart,
  label: "Chart/Stats"
},
{
  icon: Filter,
  label: "Filter"
},
{
  icon: Plus,
  label: "Add New"
},
{
  icon: RotateCcw,
  label: "Refresh"
},
{
  icon: Columns,
  label: "Manage Columns"
} ];
export const CRMToolbar = ({
  title,
  actions = defaultActions,
  onAction,
  className,
  leadingContent,
  showMoreOptions = true
}) => {
  

  const emitGlobal = (actionKey) => {
    try {
      const event = new CustomEvent('crm-toolbar-action', { detail: { action: actionKey } });
      window.dispatchEvent(event);
    } catch (_) { /* noop */ }
  };

  const normalizeActionLabel = (label = "") =>
    label.toLowerCase().replace(/\s+/g, "-");

  const handleActionTrigger = (action) => {
    if (!action) return;
    action.onClick?.();
    const normalized = normalizeActionLabel(action.label || "");
    onAction?.(normalized);
    emitGlobal(normalized);
  };

  const navigate = useNavigate();
  const userName = (typeof window !== 'undefined' && (localStorage.getItem('userName') || 'Admin')) || 'Admin';

  // Hidden file input ref
  const fileInputRef = React.useRef(null);

  const getImportUrl = (opts = {}) => {
    const t = (title || "").toLowerCase();
    if (t.includes("accounts")) {
      // Optionally add query params
      const base = `${API_PREFIX}/accounts/import-excel`;
      if (opts && opts.query) return `${base}?${new URLSearchParams(opts.query).toString()}`;
      return base;
    }
    if (t.includes("contacts")) return `${API_PREFIX}/contacts/import-excel`;
    if (t.includes("leads")) return `${API_PREFIX}/leads/import-excel`;
    if (t.includes("products")) return `${API_PREFIX}/products/import-excel`;
    if (t.includes("suppliers")) {
      const base = `${API_PREFIX}/suppliers/import-excel`;
      if (opts && opts.query) return `${base}?${new URLSearchParams(opts.query).toString()}`;
      return base;
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Ask for additional contact creation when importing Accounts
    let url;
    const lowerTitle = (title || "").toLowerCase();
    const isAccounts = lowerTitle.includes("accounts");
    const isSuppliers = lowerTitle.includes("suppliers");
    if (isAccounts) {
      const alsoCreateContacts = window.confirm("Also create Contacts for imported Accounts?\nThis will add a contact per account using mainContact, email, and related fields if not already present.");
      url = getImportUrl({ query: alsoCreateContacts ? { createContacts: 'true' } : undefined });
    } else if (isSuppliers) {
      const alsoCreateContacts = window.confirm("Also create Supplier Contacts for imported Suppliers?\nThis will add a contact per supplier using fields if not already present.");
      url = getImportUrl({ query: alsoCreateContacts ? { createContacts: 'true' } : undefined });
    } else {
      url = getImportUrl();
    }
    if (!url) {
      toast({ title: "Import not available", description: "This page doesn't support Excel import.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res?.data || {};
      if (typeof data.processed === 'number') {
        if (data.processed > 0) {
          const extra = (typeof data.contactsCreated === 'number' && data.contactsCreated > 0)
            ? ` | Contacts Created: ${data.contactsCreated}`
            : '';
          toast({
            title: "Import completed",
            description: `Processed: ${data.processed} | Created: ${data.created || 0} | Updated: ${data.updated || 0}${extra}`,
          });
        } else {
          toast({ title: "No valid rows to import", description: `${file.name}`, variant: "destructive" });
        }
      } else {
        // Fallback generic success
        toast({ title: "Import successful", description: `${file.name} imported.` });
      }
      emitGlobal('refresh');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Import failed';
      toast({ title: "Import failed", description: msg, variant: "destructive" });
    } finally {
      // reset input to allow re-uploading same file
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    try {
      // Clear common auth/session storage keys
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      sessionStorage.clear();
    } catch (_) {}
    navigate('/login');
  };

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-between",
        "rounded-lg bg-card/95",
        "px-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leadingContent}
        {title && (
          <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Only show the custom navbar on the Dashboard page */}
        {title === 'Dashboard' ? (
          <>
            {/* Refresh button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0 rounded-full",
                      "text-primary hover:text-primary-foreground hover:bg-primary",
                      "transition-all duration-200"
                    )}
                    onClick={() => {
                      const key = 'refresh';
                      onAction?.(key);
                      emitGlobal(key);
                      // Optional: full page reload fallback
                      // window.location.reload();
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Profile / Admin avatar with dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <Avatar className="h-9 w-9 ring-1 ring-border">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="bg-muted text-foreground">
                      {userName?.[0]?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-md">
                <DropdownMenuLabel className="py-2">
                  <div className="text-sm font-medium">{userName}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          // Fallback to existing action buttons (if any were passed)
          <TooltipProvider>
            {actions.map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0",
                      "text-primary hover:text-primary-foreground hover:bg-primary",
                      "transition-all duration-200"
                    )}
                    onClick={() => {
                      action.onClick?.();
                      const key = action.label.toLowerCase().replace(/\s+/g, '-');
                      const normalized = key === 'add-new' ? 'add-new' :
                        key === 'manage-columns' ? 'manage-columns' :
                        key === 'refresh' ? 'refresh' :
                        key === 'sort' ? 'sort' : key;
                      onAction?.(normalized);
                      emitGlobal(normalized);
                    }}
                  >
                    <action.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {showMoreOptions && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 w-9 p-0",
                        "text-primary hover:text-primary-foreground hover:bg-primary",
                        "transition-all duration-200"
                      )}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>More Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      Import Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

