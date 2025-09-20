import React,
{
  useState
} from "react";
import {
  CRMToolbar
} from "@/components/layout/CRMToolbar";
import {
  FormCard
} from "@/components/forms/FormCard";
import {
  FormSection
} from "@/components/forms/FormSection";
import {
  Input
} from "@/components/ui/input";
import {
  Label
} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  Button
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Badge
} from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
// Sample data for leads with all required fields
const sampleLeads = [
  {
    id: 1,
    name: "Enterprise Software Solution",
    company: "TechStart Inc",
  contactName: "Alex Johnson",
  status: "In Process",
  qualificationLevel: "Hot",
  source: "Website",
  category: "Enterprise",
  priority: "High",
  campaign: "Q1 Digital Campaign",
  owner: "John Smith",
  followUpActivity: "Product Demo",
  city: "San Francisco",
  country: "United States",
  state: "California",
  postalCode: "94105",
  language: "English",
  phone: "+1 (555) 111-2222",
  mobile: "+1 (555) 111-2223",
  email: "alex.johnson@techstart.com",
  note: "Interested in enterprise-level solution for 500+ users"
},
{
  id: 2,
  name: "Cloud Migration Project",
  company: "Legacy Systems Corp",
  contactName: "Maria Garcia",
  status: "Qualified",
  qualificationLevel: "Warm",
  source: "Referral",
  category: "Cloud Services",
  priority: "Medium",
  campaign: "Cloud Migration 2024",
  owner: "Sarah Johnson",
  followUpActivity: "Technical Assessment",
  city: "Austin",
  country: "United States",
  state: "Texas",
  postalCode: "78701",
  language: "English",
  phone: "+1 (555) 333-4444",
  mobile: "+1 (555) 333-4445",
  email: "maria.garcia@legacy.com",
  note: "Looking to migrate legacy systems to cloud infrastructure"
},
{
  id: 3,
  name: "Digital Transformation Initiative",
  company: "Traditional Business Ltd",
  contactName: "Robert Chen",
  status: "In Process",
  qualificationLevel: "Hot",
  source: "Trade Show",
  category: "Digital Transformation",
  priority: "High",
  campaign: "Transform 2024",
  owner: "Mike Wilson",
  followUpActivity: "Strategy Workshop",
  city: "Seattle",
  country: "United States",
  state: "Washington",
  postalCode: "98101",
  language: "English",
  phone: "+1 (555) 555-6666",
  mobile: "+1 (555) 555-6667",
  email: "robert.chen@traditional.com",
  note: "Complete digital transformation for manufacturing processes"
},
{
  id: 4,
  name: "CRM Implementation",
  company: "Growing Startup",
  contactName: "Lisa Thompson",
  status: "New",
  qualificationLevel: "Cold",
  source: "Cold Call",
  category: "CRM",
  priority: "Low",
  campaign: "Startup Outreach",
  owner: "Emily Davis",
  followUpActivity: "Discovery Call",
  city: "Denver",
  country: "United States",
  state: "Colorado",
  postalCode: "80202",
  language: "English",
  phone: "+1 (555) 777-8888",
  mobile: "+1 (555) 777-8889",
  email: "lisa.thompson@growing.com",
  note: "Small startup looking for affordable CRM solution"
},
{
  id: 5,
  name: "Data Analytics Platform",
  company: "Analytics Pro",
  contactName: "James Wilson",
  status: "Qualified",
  qualificationLevel: "Warm",
  source: "LinkedIn",
  category: "Analytics",
  priority: "Medium",
  campaign: "Data Insights 2024",
  owner: "David Brown",
  followUpActivity: "ROI Analysis",
  city: "Miami",
  country: "United States",
  state: "Florida",
  postalCode: "33101",
  language: "English",
  phone: "+1 (555) 999-0000",
  mobile: "+1 (555) 999-0001",
  email: "james.wilson@analyticspro.com",
  note: "Need advanced analytics platform for business intelligence"
} ];
const Leads = () => {
  ;
  const [showForm,
  setShowForm] = useState(false);
  const [leads,
  setLeads] = useState(sampleLeads);
  const [searchTerm,
  setSearchTerm] = useState("");
  const [sortField,
  setSortField] = useState("");
  const [sortDirection,
  setSortDirection] = useState("asc");
  const [currentPage,
  setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowForm(true);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
  };
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const filteredLeads = leads.filter(lead => Object.values(lead).some(value => value.toString().toLowerCase().includes(searchTerm.toLowerCase()) ) );
  const sortedLeads = [...filteredLeads].sort((a,
  b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex,
  startIndex + itemsPerPage);
  const getStatusBadge = (status) => {
    ;
    const variant = status === "Qualified" ? "default" : status === "In Process" ? "secondary" : "outline";
    return <Badge variant={
      variant
    }>{
      status
    }</Badge>;
  };
  const getPriorityBadge = (priority) => {
    ;
    const variant = priority === "High" ? "destructive" : priority === "Medium" ? "default" : "outline";
    return <Badge variant={
      variant
    }>{
      priority
    }</Badge>;
  };
  const getQualificationBadge = (level) => {
    ;
    const variant = level === "Hot" ? "destructive" : level === "Warm" ? "default" : "outline";
    return <Badge variant={
      variant
    }>{
      level
    }</Badge>;
  };
  if (showForm) {
    return ( <div className="min-h-screen bg-background">
    <CRMToolbar title="Leads - New Lead" onAction={
      handleToolbarAction
    } />
    <div className="p-6">
    <FormCard title="Lead Information">
    <FormSection title="General Details">
    <div className="space-y-2">
    <Label htmlFor="leadName">Name</Label>
    <Input id="leadName" placeholder="Enter lead name" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="company">Company</Label>
    <Input id="company" placeholder="Enter company name" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="contactName">Contact Name</Label>
    <Input id="contactName" placeholder="Enter contact name" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="status">Status</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="new">New</SelectItem>
    <SelectItem value="in-process">In Process</SelectItem>
    <SelectItem value="qualified">Qualified</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="qualificationLevel">Qualification Level</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select qualification level" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="cold">Cold</SelectItem>
    <SelectItem value="warm">Warm</SelectItem>
    <SelectItem value="hot">Hot</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="source">Source</Label>
    <Input id="source" placeholder="Enter lead source" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="category">Category</Label>
    <Input id="category" placeholder="Enter category" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="priority">Priority</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select priority" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="campaign">Campaign</Label>
    <Input id="campaign" placeholder="Enter campaign" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="owner">Owner</Label>
    <Input id="owner" placeholder="Enter owner" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="followUpActivity">Follow-up Activity</Label>
    <Input id="followUpActivity" placeholder="Enter follow-up activity" />
    </div>
    </FormSection>
    <FormSection title="Location Information">
    <div className="space-y-2">
    <Label htmlFor="city">City</Label>
    <Input id="city" placeholder="Enter city" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="country">Country/Region</Label>
    <Input id="country" placeholder="Enter country/region" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="state">State</Label>
    <Input id="state" placeholder="Enter state" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="postalCode">Postal Code</Label>
    <Input id="postalCode" placeholder="Enter postal code" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="language">Language</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select language" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="en">English</SelectItem>
    <SelectItem value="es">Spanish</SelectItem>
    <SelectItem value="fr">French</SelectItem>
    </SelectContent>
    </Select>
    </div>
    </FormSection>
    <FormSection title="Contact Information">
    <div className="space-y-2">
    <Label htmlFor="phone">Phone</Label>
    <Input id="phone" placeholder="Enter phone number" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="mobile">Mobile</Label>
    <Input id="mobile" placeholder="Enter mobile number" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter email address" />
    </div>
    </FormSection>
    <FormSection title="Notes">
    <div className="space-y-2 lg:col-span-2">
    <Label htmlFor="note">Note</Label>
    <Textarea id="note" placeholder="Enter notes" rows={
      4
    } />
    </div>
    </FormSection>
    <div className="flex justify-end space-x-4 pt-6 border-t border-border">
    <Button variant="outline" onClick={
      () => setShowForm(false)
    }>Cancel</Button>
    <Button onClick={
      handleSubmit
    }>Save Lead</Button>
    </div>
    </FormCard>
    </div>
    </div> );
  } return ( <div className="min-h-screen bg-background">
  <CRMToolbar title="Leads" onAction={
    handleToolbarAction
  } />
  <div className="p-6">
  <Card className="shadow-soft">
  <CardHeader>
  <div className="flex items-center justify-between">
  <CardTitle>Leads ({
    sortedLeads.length
  })</CardTitle>
  <div className="flex items-center space-x-2">
  <div className="relative">
  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input placeholder="Search leads..." value={
    searchTerm
  } onChange={
    (e) => setSearchTerm(e.target.value)
  } className="pl-8 w-64" />
  </div>
  </div>
  </div>
  </CardHeader>
  <CardContent>
  <div className="overflow-auto max-h-[600px]">
  <Table>
  <TableHeader className="sticky top-0 bg-background">
  <TableRow>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('name')
  }>Name</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('company')
  }>Company</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('contactName')
  }>Contact Name</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('status')
  }>Status</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('qualificationLevel')
  }>Qualification</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('source')
  }>Source</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('category')
  }>Category</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('priority')
  }>Priority</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('campaign')
  }>Campaign</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('owner')
  }>Owner</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('followUpActivity')
  }>Follow-up</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('city')
  }>City</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('state')
  }>State</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('phone')
  }>Phone</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('email')
  }>Email</TableHead>
  </TableRow>
  </TableHeader>
  <TableBody> {
    paginatedLeads.map((lead) => ( <TableRow key={
      lead.id
    } className="cursor-pointer hover:bg-muted/50">
    <TableCell className="font-medium">{
      lead.name
    }</TableCell>
    <TableCell>{
      lead.company
    }</TableCell>
    <TableCell>{
      lead.contactName
    }</TableCell>
    <TableCell>{
      getStatusBadge(lead.status)
    }</TableCell>
    <TableCell>{
      getQualificationBadge(lead.qualificationLevel)
    }</TableCell>
    <TableCell>{
      lead.source
    }</TableCell>
    <TableCell>{
      lead.category
    }</TableCell>
    <TableCell>{
      getPriorityBadge(lead.priority)
    }</TableCell>
    <TableCell>{
      lead.campaign
    }</TableCell>
    <TableCell>{
      lead.owner
    }</TableCell>
    <TableCell>{
      lead.followUpActivity
    }</TableCell>
    <TableCell>{
      lead.city
    }</TableCell>
    <TableCell>{
      lead.state
    }</TableCell>
    <TableCell>{
      lead.phone
    }</TableCell>
    <TableCell>
    <a href={
      `mailto:${
        lead.email
      }`
    } className="text-primary hover:underline"> {
      lead.email
    } </a>
    </TableCell>
    </TableRow> ))
  } </TableBody>
  </Table>
  </div> {
    /* Pagination */
  } <div className="flex items-center justify-between mt-4">
  <div className="text-sm text-muted-foreground"> Showing {
    startIndex + 1
  } to {
    Math.min(startIndex + itemsPerPage,
    sortedLeads.length)
  } of {
    sortedLeads.length
  } entries </div>
  <div className="flex items-center space-x-2">
  <Button variant="outline" size="sm" onClick={
    () => setCurrentPage(prev => Math.max(prev - 1,
    1))
  } disabled={
    currentPage === 1
  } >
  <ChevronLeft className="h-4 w-4" /> Previous </Button>
  <span className="text-sm"> Page {
    currentPage
  } of {
    totalPages
  } </span>
  <Button variant="outline" size="sm" onClick={
    () => setCurrentPage(prev => Math.min(prev + 1,
    totalPages))
  } disabled={
    currentPage === totalPages
  } > Next <ChevronRight className="h-4 w-4" />
  </Button>
  </div>
  </div>
  </CardContent>
  </Card>
  </div>
  </div> );
};
export default Leads;
