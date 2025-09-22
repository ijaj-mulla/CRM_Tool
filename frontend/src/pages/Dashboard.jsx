import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Activity
} from "lucide-react";
const Dashboard = () => {
  ;
  const kpiCards = [ {
    title: "Total Leads",
    value: "0",
    icon: TrendingUp,
    color: "text-primary"
  },
  {
    title: "Active Opportunities",
    value: "0",
    icon: BarChart3,
    color: "text-secondary"
  },
  {
    title: "Total Customers",
    value: "0",
    icon: Users,
    color: "text-success"
  },
  {
    title: "Revenue This Month",
    value: "$0",
    icon: DollarSign,
    color: "text-warning"
  } ];
  return ( <div className="min-h-screen bg-background">
  <div className="p-6 space-y-6"> {
    /* KPI Cards */
  } <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {
    kpiCards.map((kpi,
    index) => ( <Card key={
      index
    } className="shadow-soft">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground"> {
      kpi.title
    } </CardTitle>
    <kpi.icon className={
      `w-5 h-5 ${
        kpi.color
      }`
    } />
    </CardHeader>
    <CardContent>
    <div className="text-2xl font-bold text-foreground">{
      kpi.value
    }</div>
    </CardContent>
    </Card> ))
  } </div> {
    /* Dashboard Grid */
  } <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {
    /* Personal Calendar */
  } <Card className="shadow-soft">
  <CardHeader>
  <CardTitle className="flex items-center space-x-2">
  <Calendar className="w-5 h-5 text-primary" />
  <span>Personal Calendar</span>
  </CardTitle>
  </CardHeader>
  <CardContent>
  <div className="text-center py-8 text-muted-foreground">
  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
  <p>No events scheduled</p>
  </div>
  </CardContent>
  </Card> {
    /* My Open Visits */
  } <Card className="shadow-soft">
  <CardHeader>
  <CardTitle className="flex items-center space-x-2">
  <Activity className="w-5 h-5 text-primary" />
  <span>My Open Visits</span>
  </CardTitle>
  </CardHeader>
  <CardContent>
  <div className="text-center py-8 text-muted-foreground">
  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
  <p>No open visits</p>
  </div>
  </CardContent>
  </Card> {
    /* Recent Activity */
  } <Card className="shadow-soft lg:col-span-2">
  <CardHeader>
  <CardTitle className="flex items-center space-x-2">
  <BarChart3 className="w-5 h-5 text-primary" />
  <span>Recent Activity</span>
  </CardTitle>
  </CardHeader>
  <CardContent>
  <div className="text-center py-8 text-muted-foreground">
  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
  <p>No recent activity</p>
  </div>
  </CardContent>
  </Card>
  </div>
  </div>
  </div> );
};
export default Dashboard;
