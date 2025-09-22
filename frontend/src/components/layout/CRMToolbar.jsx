import React from "react";
import {
  Button
} from "@/components/ui/button";
import {
  ArrowUpDown,
  PieChart,
  Filter,
  Plus,
  RotateCcw,
  MoreHorizontal,
  Columns
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cn
} from "@/lib/utils";
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
},
{
  icon: MoreHorizontal,
  label: "More Options"
} ];
export const CRMToolbar = ({
  title,
  actions = defaultActions,
  onAction,
  className
}) => {
  const emitGlobal = (actionKey) => {
    try {
      const event = new CustomEvent('crm-toolbar-action', { detail: { action: actionKey } });
      window.dispatchEvent(event);
    } catch (_) { /* noop */ }
  };
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-card border-b border-border",
      "shadow-soft",
      className
    )}>
      {title && (
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      )}
      <div className="flex items-center space-x-1 ml-auto">
  <TooltipProvider> {
    actions.map((action,
    index) => ( <Tooltip key={
      index
    }>
    <TooltipTrigger asChild>
    <Button variant="ghost" size="sm" className={
      cn( "h-9 w-9 p-0",
      "text-primary hover:text-primary-foreground hover:bg-primary",
      "transition-all duration-200" )
    } onClick={
      () => {
        action.onClick?.();
        const key = action.label.toLowerCase().replace(/\s+/g, '-');
        // Normalize some keys to consistent identifiers
        const normalized = key === 'add-new' ? 'add-new' :
          key === 'manage-columns' ? 'manage-columns' :
          key === 'refresh' ? 'refresh' :
          key === 'sort' ? 'sort' : key;
        onAction?.(normalized);
        emitGlobal(normalized);
      }
    } >
    <action.icon className="w-4 h-4" />
    </Button>
    </TooltipTrigger>
    <TooltipContent>
    <p className="text-xs">{
      action.label
    }</p>
    </TooltipContent>
    </Tooltip> ))
  } </TooltipProvider>
  </div>
  </div> );
};
