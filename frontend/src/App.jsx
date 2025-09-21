import {
  Toaster
} from "@/components/ui/toaster";
import {
  Toaster as Sonner
} from "@/components/ui/sonner";
import {
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import {
  CRMLayout
} from "@/components/layout/CRMLayout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Accounts from "./pages/customers/Accounts";
import Contacts from "./pages/customers/Contacts";
import Leads from "./pages/sales/Leads";
import Opportunities from "./pages/sales/Opportunities";
import SalesQuotes from "./pages/sales/SalesQuotes";
import SalesOrders from "./pages/sales/SalesOrders";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => ( <QueryClientProvider client={
  queryClient
}>
<TooltipProvider>
<Toaster />
<Sonner />
<BrowserRouter>
<CRMLayout>
<Routes>
<Route path="/" element={
  <Dashboard />
} />
<Route path="/calendar" element={
  <Calendar />
} />
<Route path="/customers/accounts" element={
  <Accounts />
} />
<Route path="/customers/contacts" element={
  <Contacts />
} />
<Route path="/sales/leads" element={
  <Leads />
} />
<Route path="/sales/opportunities" element={
  <Opportunities />
} />
<Route path="/sales/quotes" element={
  <SalesQuotes />
} />
<Route path="/sales/orders" element={
  <SalesOrders />
} /> {
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
} <Route path="*" element={
  <NotFound />
} />
</Routes>
</CRMLayout>
</BrowserRouter>
</TooltipProvider>
</QueryClientProvider> );
export default App;
