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
  Route,
  useLocation
} from "react-router-dom";
import {
  CRMLayout
} from "@/components/layout/CRMLayout";
import AutomationNotifications from "@/components/realtime/AutomationNotifications";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Accounts from "./pages/customers/Accounts";
import Contacts from "./pages/customers/Contacts";
import Competitors from "./pages/customers/Competitors";
import Suppliers from "./pages/suppliers/Suppliers";
import SupplierContacts from "./pages/suppliers/SupplierContacts";
import Products from "./pages/products/Products";
import Leads from "./pages/sales/Leads";
import Opportunities from "./pages/sales/Opportunities";
import SalesQuotes from "./pages/sales/SalesQuotes";
import SalesOrders from "./pages/sales/SalesOrders";
import Appointments from "./pages/activities/Appointments";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/activities/Tasks";
import EmailsPage from "./pages/activities/EmailsPage";
const queryClient = new QueryClient();
const AppRoutes = () => {
  const location = useLocation();
  const key = location.pathname + location.search;
  return (
    <Routes>
      <Route path="/" element={<Dashboard key={key} />} />
      <Route path="/calendar" element={<Calendar key={key} />} />
      <Route path="/customers/accounts" element={<Accounts key={key} />} />
      <Route path="/customers/contacts" element={<Contacts key={key} />} />
      <Route path="/customers/competitors" element={<Competitors key={key} />} />
      <Route path="/suppliers/suppliers" element={<Suppliers key={key} />} />
      <Route path="/suppliers/contacts" element={<SupplierContacts key={key} />} />
      <Route path="/products/products" element={<Products key={key} />} />
      <Route path="/sales/leads" element={<Leads key={key} />} />
      <Route path="/sales/opportunities" element={<Opportunities key={key} />} />
      <Route path="/sales/quotes" element={<SalesQuotes key={key} />} />
      <Route path="/sales/appointments" element={<Appointments key={key} />} />
      <Route path="/activities/appointments" element={<Appointments key={key} />} />
      <Route path="/activities/tasks" element={<Tasks key={key} />} />
      <Route path="/activities/emails" element={<EmailsPage key={key} />} />
      <Route path="/sales/orders" element={<SalesOrders key={key} />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound key={key} />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" closeButton richColors duration={4000} />
      <BrowserRouter>
        <CRMLayout>
          <AutomationNotifications />
          <AppRoutes />
        </CRMLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
