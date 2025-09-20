import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  cn
} from "@/lib/utils";
export const FormCard = ({
  title,
  children,
  className
}) => {
  return (
    <Card className={cn("shadow-soft", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-foreground">{title}</CardTitle>
      </CardHeader>
  <CardContent className="space-y-6"> {
    children
  } </CardContent>
  </Card> );
};
