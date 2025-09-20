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
// Sample data for accounts with all required fields
const sampleAccounts = [
  {
    id: 1,
    accountId: "ACC-001",
    accountType: "Customer",
    accountName: "TechCorp Solutions Inc",
  prospectRole: "Decision Maker",
  website: "www.techcorp.com",
  status: "Active",
  salesOrganization: "North America Sales",
  buAssignment: "Enterprise Division",
  industryHorizontal: "Technology",
  vertical: "Software",
  subVertical: "Enterprise Software",
  country: "United States",
  postalCode: "94105",
  city: "San Francisco",
  state: "California",
  district: "Financial District",
  street: "123 Tech Street",
  territory: "West Coast",
  owner: "John Smith",
  taxCountry: "United States",
  taxNumberType: "EIN",
  taxNumber: "12-3456789"
},
{
  id: 2,
  accountId: "ACC-002",
  accountType: "Prospect",
  accountName: "Global Manufacturing Ltd",
  prospectRole: "Influencer",
  website: "www.globalmfg.com",
  status: "Prospect",
  salesOrganization: "International Sales",
  buAssignment: "Manufacturing Division",
  industryHorizontal: "Manufacturing",
  vertical: "Industrial",
  subVertical: "Heavy Machinery",
  country: "United States",
  postalCode: "48201",
  city: "Detroit",
  state: "Michigan",
  district: "Industrial Zone",
  street: "456 Industrial Ave",
  territory: "Midwest",
  owner: "Sarah Johnson",
  taxCountry: "United States",
  taxNumberType: "EIN",
  taxNumber: "98-7654321"
},
{
  id: 3,
  accountId: "ACC-003",
  accountType: "Partner",
  accountName: "Digital Marketing Agency",
  prospectRole: "User",
  website: "www.digitalagency.com",
  status: "Active",
  salesOrganization: "Partner Channel",
  buAssignment: "Services Division",
  industryHorizontal: "Marketing",
  vertical: "Digital Services",
  subVertical: "Performance Marketing",
  country: "United States",
  postalCode: "10001",
  city: "New York",
  state: "New York",
  district: "Manhattan",
  street: "789 Marketing Blvd",
  territory: "East Coast",
  owner: "Mike Wilson",
  taxCountry: "United States",
  taxNumberType: "EIN",
  taxNumber: "55-9876543"
},
{
  id: 4,
  accountId: "ACC-004",
  accountType: "Customer",
  accountName: "Healthcare Systems Inc",
  prospectRole: "Decision Maker",
  website: "www.healthsystems.com",
  status: "Active",
  salesOrganization: "Healthcare Sales",
  buAssignment: "Healthcare Division",
  industryHorizontal: "Healthcare",
  vertical: "Medical Technology",
  subVertical: "Hospital Systems",
  country: "United States",
  postalCode: "02101",
  city: "Boston",
  state: "Massachusetts",
  district: "Medical District",
  street: "321 Health Way",
  territory: "Northeast",
  owner: "Emily Davis",
  taxCountry: "United States",
  taxNumberType: "EIN",
  taxNumber: "77-1234567"
},
{
  id: 5,
  accountId: "ACC-005",
  accountType: "Prospect",
  accountName: "Financial Services Group",
  prospectRole: "Influencer",
  website: "www.finservices.com",
  status: "Prospect",
  salesOrganization: "Financial Services",
  buAssignment: "Finance Division",
  industryHorizontal: "Finance",
  vertical: "Banking",
  subVertical: "Investment Banking",
  country: "United States",
  postalCode: "60601",
  city: "Chicago",
  state: "Illinois",
  district: "Financial District",
  street: "654 Finance St",
  territory: "Central",
  owner: "David Brown",
  taxCountry: "United States",
  taxNumberType: "EIN",
  taxNumber: "33-7890123"
} ];
const Accounts = () => {
  ;
  const [showForm,
  setShowForm] = useState(false);
  const [accounts,
  setAccounts] = useState(sampleAccounts);
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
  const filteredAccounts = accounts.filter(account => Object.values(account).some(value => value.toString().toLowerCase().includes(searchTerm.toLowerCase()) ) );
  const sortedAccounts = [...filteredAccounts].sort((a,
  b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });
  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = sortedAccounts.slice(startIndex,
  startIndex + itemsPerPage);
  const getStatusBadge = (status) => {
    ;
    const variant = status === "Active" ? "default" : status === "Prospect" ? "secondary" : "outline";
    return <Badge variant={
      variant
    }>{
      status
    }</Badge>;
  };
  if (showForm) {
    return ( <div className="min-h-screen bg-background">
    <CRMToolbar title="Accounts - New Account" onAction={
      handleToolbarAction
    } />
    <div className="p-6">
    <FormCard title="Account Information">
    <FormSection title="Account Information">
    <div className="space-y-2">
    <Label htmlFor="accountId">Account ID</Label>
    <Input id="accountId" placeholder="Enter account ID" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="accountType">Account Type</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select account type" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="prospect">Prospect</SelectItem>
    <SelectItem value="customer">Customer</SelectItem>
    <SelectItem value="partner">Partner</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="accountName">Account Name</Label>
    <Input id="accountName" placeholder="Enter account name" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="prospectRole">Prospect Role</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select prospect role" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="decision-maker">Decision Maker</SelectItem>
    <SelectItem value="influencer">Influencer</SelectItem>
    <SelectItem value="user">User</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="website">Website</Label>
    <Input id="website" placeholder="Enter website URL" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="status">Status</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="prospect">Prospect</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
    </SelectContent>
    </Select>
    </div>
    </FormSection>
    <FormSection title="Sales & Business Details">
    <div className="space-y-2">
    <Label htmlFor="salesOrg">Sales Organization</Label>
    <Input id="salesOrg" placeholder="Enter sales organization" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="buAssignment">BU Assignment</Label>
    <Input id="buAssignment" placeholder="Enter BU assignment" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="industryHorizontal">Industry Categories (Horizontal)</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select horizontal category" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="technology">Technology</SelectItem>
    <SelectItem value="healthcare">Healthcare</SelectItem>
    <SelectItem value="finance">Finance</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="vertical">Vertical</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select vertical category" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="software">Software</SelectItem>
    <SelectItem value="hardware">Hardware</SelectItem>
    <SelectItem value="services">Services</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="subVertical">Sub Vertical</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select sub vertical" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="enterprise">Enterprise</SelectItem>
    <SelectItem value="smb">SMB</SelectItem>
    <SelectItem value="startup">Startup</SelectItem>
    </SelectContent>
    </Select>
    </div>
    </FormSection>
    <FormSection title="Location Details">
    <div className="space-y-2">
    <Label htmlFor="country">Country/Region</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select country/region" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="us">United States</SelectItem>
    <SelectItem value="uk">United Kingdom</SelectItem>
    <SelectItem value="ca">Canada</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="postalCode">Postal Code</Label>
    <Input id="postalCode" placeholder="Enter postal code" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="city">City</Label>
    <Input id="city" placeholder="Enter city" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="state">State</Label>
    <Input id="state" placeholder="Enter state" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="district">District</Label>
    <Input id="district" placeholder="Enter district" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="street">Street</Label>
    <Input id="street" placeholder="Enter street address" />
    </div>
    </FormSection>
    <FormSection title="Territory Management">
    <div className="space-y-2">
    <Label htmlFor="territory">Territory</Label>
    <Input id="territory" placeholder="Enter territory" />
    </div>
    <div className="space-y-2">
    <Label htmlFor="owner">Owner</Label>
    <Input id="owner" placeholder="Enter owner" />
    </div>
    </FormSection>
    <FormSection title="Tax Information">
    <div className="space-y-2">
    <Label htmlFor="taxCountry">Tax Country/Region</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select tax country/region" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="us">United States</SelectItem>
    <SelectItem value="uk">United Kingdom</SelectItem>
    <SelectItem value="ca">Canada</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="taxNumberType">Tax Number Type</Label>
    <Select>
    <SelectTrigger>
    <SelectValue placeholder="Select tax number type" />
    </SelectTrigger>
    <SelectContent>
    <SelectItem value="ein">EIN</SelectItem>
    <SelectItem value="vat">VAT</SelectItem>
    <SelectItem value="gstin">GSTIN</SelectItem>
    </SelectContent>
    </Select>
    </div>
    <div className="space-y-2">
    <Label htmlFor="taxNumber">Tax Number</Label>
    <Input id="taxNumber" placeholder="Enter tax number" />
    </div>
    </FormSection>
    <div className="flex justify-end space-x-4 pt-6 border-t border-border">
    <Button variant="outline" onClick={
      () => setShowForm(false)
    }>Cancel</Button>
    <Button onClick={
      handleSubmit
    }>Save Account</Button>
    </div>
    </FormCard>
    </div>
    </div> );
  } return ( <div className="min-h-screen bg-background">
  <CRMToolbar title="Accounts" onAction={
    handleToolbarAction
  } />
  <div className="p-6">
  <Card className="shadow-soft">
  <CardHeader>
  <div className="flex items-center justify-between">
  <CardTitle>Accounts ({
    sortedAccounts.length
  })</CardTitle>
  <div className="flex items-center space-x-2">
  <div className="relative">
  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input placeholder="Search accounts..." value={
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
    () => handleSort('accountId')
  }>Account ID</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('accountType')
  }>Type</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('accountName')
  }>Account Name</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('prospectRole')
  }>Prospect Role</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('website')
  }>Website</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('status')
  }>Status</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('salesOrganization')
  }>Sales Org</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('buAssignment')
  }>BU Assignment</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('industryHorizontal')
  }>Industry</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('vertical')
  }>Vertical</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('subVertical')
  }>Sub Vertical</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('city')
  }>City</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('state')
  }>State</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('country')
  }>Country</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('territory')
  }>Territory</TableHead>
  <TableHead className="cursor-pointer" onClick={
    () => handleSort('owner')
  }>Owner</TableHead>
  </TableRow>
  </TableHeader>
  <TableBody> {
    paginatedAccounts.map((account) => ( <TableRow key={
      account.id
    } className="cursor-pointer hover:bg-muted/50">
    <TableCell className="font-medium">{
      account.accountId
    }</TableCell>
    <TableCell>{
      account.accountType
    }</TableCell>
    <TableCell className="font-medium">{
      account.accountName
    }</TableCell>
    <TableCell>{
      account.prospectRole
    }</TableCell>
    <TableCell>
    <a href={
      `https://${
        account.website
      }`
    } target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> {
      account.website
    } </a>
    </TableCell>
    <TableCell>{
      getStatusBadge(account.status)
    }</TableCell>
    <TableCell>{
      account.salesOrganization
    }</TableCell>
    <TableCell>{
      account.buAssignment
    }</TableCell>
    <TableCell>{
      account.industryHorizontal
    }</TableCell>
    <TableCell>{
      account.vertical
    }</TableCell>
    <TableCell>{
      account.subVertical
    }</TableCell>
    <TableCell>{
      account.city
    }</TableCell>
    <TableCell>{
      account.state
    }</TableCell>
    <TableCell>{
      account.country
    }</TableCell>
    <TableCell>{
      account.territory
    }</TableCell>
    <TableCell>{
      account.owner
    }</TableCell>
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
    sortedAccounts.length)
  } of {
    sortedAccounts.length
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
export default Accounts;
