import React from "react";
import {
  Button
} from "@/components/ui/button";
import {
  Search,
  ArrowUpDown,
  PieChart,
  Filter,
  Plus,
  RotateCcw,
  MoreHorizontal
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
  icon: Search,
  label: "Search"
},
{
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
  icon: MoreHorizontal,
  label: "More Options"
} ];
export const CRMToolbar = ({
  title,
  actions = defaultActions,
  onAction,
  className
}) => {
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
        onAction?.(action.label.toLowerCase().replace(/\s+/g,
        '-'));
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
