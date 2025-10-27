import React, { useEffect } from "react";
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
  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') {
        // Placeholder: no data to reload yet
      } else if (a === 'add-new') {
        // Placeholder: could open a future event form
        // noop for now
      }
    };
    window.addEventListener('crm-toolbar-action', handler);
    return () => window.removeEventListener('crm-toolbar-action', handler);
  }, []);
  return ( <div className="min-h-screen bg-background">
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
