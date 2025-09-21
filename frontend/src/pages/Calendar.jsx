import React from "react";
import {
  CRMToolbar
} from "@/components/layout/CRMToolbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Calendar as CalendarIcon
} from "lucide-react";
const Calendar = () => {
  return ( <div className="min-h-screen bg-background">
  <CRMToolbar title="Personal Calendar" />
  <div className="p-6">
  <Card className="shadow-soft">
  <CardHeader>
  <CardTitle className="flex items-center space-x-2">
  <CalendarIcon className="w-5 h-5 text-primary" />
  <span>Calendar View</span>
  </CardTitle>
  </CardHeader>
  <CardContent>
  <div className="text-center py-16 text-muted-foreground">
  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
  <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
  <p>Your calendar is empty. Start by adding some appointments or meetings.</p>
  </div>
  </CardContent>
  </Card>
  </div>
  </div> );
};
export default Calendar;
