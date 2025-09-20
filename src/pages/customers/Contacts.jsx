import React, { useState } from "react";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
import { FormCard } from "@/components/forms/FormCard";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";

// Sample data for contacts with all specified fields
const sampleContacts = [
  {
    id: 1,
    title: "Mr.",
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    mobile: "+1 (555) 987-6543",
    account: "TechCorp Solutions",
    department: "Executive",
    technicalFunction: "Technology",
    function: "Management",
    contactId: "CT-001",
    externalId: "EXT-001",
    language: "English",
    accountId: "ACC-001",
    email: "john.smith@techcorp.com",
    status: "Active",
    jobTitle: "CEO",
    state: "California",
    country: "United States",
    createdBy: "System Admin"
  },
  {
    id: 2,
    title: "Dr.",
    name: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    mobile: "+1 (555) 876-5432",
    account: "Global Manufacturing Ltd",
    department: "Technology",
    technicalFunction: "Engineering",
    function: "Technical",
    contactId: "CT-002",
    externalId: "EXT-002",
    language: "English",
    accountId: "ACC-002",
    email: "sarah.johnson@globalmfg.com",
    status: "Active",
    jobTitle: "CTO",
    state: "Michigan",
    country: "United States",
    createdBy: "John Smith"
  },
  {
    id: 3,
    title: "Ms.",
    name: "Mike Wilson",
    phone: "+1 (555) 345-6789",
    mobile: "+1 (555) 765-4321",
    account: "Digital Marketing Agency",
    department: "Sales",
    technicalFunction: "Sales",
    function: "Business",
    contactId: "CT-003",
    externalId: "EXT-003",
    language: "English",
    accountId: "ACC-003",
    email: "mike.wilson@digitalagency.com",
    status: "Active",
    jobTitle: "VP Sales",
    state: "New York",
    country: "United States",
    createdBy: "Sarah Johnson"
  },
  {
    id: 4,
    title: "Mrs.",
    name: "Emily Davis",
    phone: "+1 (555) 456-7890",
    mobile: "+1 (555) 654-3210",
    account: "Healthcare Systems Inc",
    department: "Operations",
    technicalFunction: "Operations",
    function: "Management",
    contactId: "CT-004",
    externalId: "EXT-004",
    language: "English",
    accountId: "ACC-004",
    email: "emily.davis@healthsystems.com",
    status: "Inactive",
    jobTitle: "Director",
    state: "Massachusetts",
    country: "United States",
    createdBy: "Mike Wilson"
  },
  {
    id: 5,
    title: "Mr.",
    name: "David Brown",
    phone: "+1 (555) 567-8901",
    mobile: "+1 (555) 543-2109",
    account: "Financial Services Group",
    department: "Finance",
    technicalFunction: "Finance",
    function: "Business",
    contactId: "CT-005",
    externalId: "EXT-005",
    language: "English",
    accountId: "ACC-005",
    email: "david.brown@finservices.com",
    status: "Active",
    jobTitle: "Manager",
    state: "Illinois",
    country: "United States",
    createdBy: "Emily Davis"
  },
  {
    id: 6,
    title: "Ms.",
    name: "Lisa Anderson",
    phone: "+1 (555) 678-9012",
    mobile: "+1 (555) 432-1098",
    account: "Retail Corporation",
    department: "Marketing",
    technicalFunction: "Marketing",
    function: "Business",
    contactId: "CT-006",
    externalId: "EXT-006",
    language: "English",
    accountId: "ACC-006",
    email: "lisa.anderson@retailcorp.com",
    status: "Active",
    jobTitle: "VP Marketing",
    state: "California",
    country: "United States",
    createdBy: "David Brown"
  },
  {
    id: 7,
    title: "Mr.",
    name: "Robert Taylor",
    phone: "+1 (555) 789-0123",
    mobile: "+1 (555) 321-0987",
    account: "Strategic Consulting",
    department: "Consulting",
    technicalFunction: "Consulting",
    function: "Business",
    contactId: "CT-007",
    externalId: "EXT-007",
    language: "English",
    accountId: "ACC-007",
    email: "robert.taylor@consulting.com",
    status: "Active",
    jobTitle: "Senior Partner",
    state: "District of Columbia",
    country: "United States",
    createdBy: "Lisa Anderson"
  }
];

const Contacts = () => {
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState(sampleContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowModal(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add new contact logic here
    setShowModal(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredContacts = contacts.filter(contact => 
    Object.values(contact).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const variant = status === "Active" ? "default" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <CRMToolbar title="Contacts" onAction={handleToolbarAction} />
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contacts ({sortedContacts.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search contacts..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-8 w-64" 
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                      Title
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      Name
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('phone')}>
                      Phone
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('mobile')}>
                      Mobile
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('account')}>
                      Account
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('department')}>
                      Department
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('technicalFunction')}>
                      Technical Function
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('function')}>
                      Function
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('contactId')}>
                      Contact ID
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('externalId')}>
                      External ID
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('language')}>
                      Language
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('accountId')}>
                      Account ID
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                      Email
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      Status
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('jobTitle')}>
                      Job Title
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('state')}>
                      State
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('country')}>
                      Country
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('createdBy')}>
                      Created By
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.map((contact) => (
                    <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>{contact.title}</TableCell>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.mobile}</TableCell>
                      <TableCell>{contact.account}</TableCell>
                      <TableCell>{contact.department}</TableCell>
                      <TableCell>{contact.technicalFunction}</TableCell>
                      <TableCell>{contact.function}</TableCell>
                      <TableCell>{contact.contactId}</TableCell>
                      <TableCell>{contact.externalId}</TableCell>
                      <TableCell>{contact.language}</TableCell>
                      <TableCell>{contact.accountId}</TableCell>
                      <TableCell>
                        <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>{contact.jobTitle}</TableCell>
                      <TableCell>{contact.state}</TableCell>
                      <TableCell>{contact.country}</TableCell>
                      <TableCell>{contact.createdBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedContacts.length)} of {sortedContacts.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Form */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="dr">Dr.</SelectItem>
                    <SelectItem value="prof">Prof.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" placeholder="Enter mobile number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input id="account" placeholder="Enter account name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Enter department" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalFunction">Technical Function</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technical function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="function">Function</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactId">Contact ID</Label>
                <Input id="contactId" placeholder="Enter contact ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalId">External ID</Label>
                <Input id="externalId" placeholder="Enter external ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input id="accountId" placeholder="Enter account ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" placeholder="Enter job title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Enter state" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="Enter country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdBy">Created By</Label>
                <Input id="createdBy" placeholder="Enter created by" />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Contact
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;