import React from "react";
import {
  cn
} from "@/lib/utils";
export const FormSection = ({
  title,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};
