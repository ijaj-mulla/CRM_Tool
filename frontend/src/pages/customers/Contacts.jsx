import React, { useState, useEffect } from "react";
import axios from "axios";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Contacts = () => {
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    phone: "",
    mobile: "",
    account: "",
    department: "",
    technicalFunction: "",
    function: "",
    contactId: "",
    externalId: "",
    language: "",
    accountId: "",
    email: "",
    status: "",
    jobTitle: "",
    state: "",
    country: "",
    createdBy: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/contacts");
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error.response?.data || error.message);
    }
  };

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowForm(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Name and Email are required.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/contacts", formData);
      setShowForm(false);
      setFormData({
        title: "",
        name: "",
        phone: "",
        mobile: "",
        account: "",
        department: "",
        technicalFunction: "",
        function: "",
        contactId: "",
        externalId: "",
        language: "",
        accountId: "",
        email: "",
        status: "",
        jobTitle: "",
        state: "",
        country: "",
        createdBy: ""
      });
      fetchContacts();
    } catch (error) {
      console.error("Error creating contact:", error.response?.data || error.message);
      alert("Failed to create contact: " + (error.response?.data?.message || error.message));
    }
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
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const variant = status === "Active" ? "default" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <CRMToolbar title="Contacts" onAction={handleToolbarAction} />
      {!showForm ? (
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
                      <TableHead onClick={() => handleSort('title')}>Title</TableHead>
                      <TableHead onClick={() => handleSort('name')}>Name</TableHead>
                      <TableHead onClick={() => handleSort('phone')}>Phone</TableHead>
                      <TableHead onClick={() => handleSort('mobile')}>Mobile</TableHead>
                      <TableHead onClick={() => handleSort('account')}>Account</TableHead>
                      <TableHead onClick={() => handleSort('department')}>Department</TableHead>
                      <TableHead onClick={() => handleSort('technicalFunction')}>Technical Function</TableHead>
                      <TableHead onClick={() => handleSort('function')}>Function</TableHead>
                      <TableHead onClick={() => handleSort('contactId')}>Contact ID</TableHead>
                      <TableHead onClick={() => handleSort('externalId')}>External ID</TableHead>
                      <TableHead onClick={() => handleSort('language')}>Language</TableHead>
                      <TableHead onClick={() => handleSort('accountId')}>Account ID</TableHead>
                      <TableHead onClick={() => handleSort('email')}>Email</TableHead>
                      <TableHead onClick={() => handleSort('status')}>Status</TableHead>
                      <TableHead onClick={() => handleSort('jobTitle')}>Job Title</TableHead>
                      <TableHead onClick={() => handleSort('state')}>State</TableHead>
                      <TableHead onClick={() => handleSort('country')}>Country</TableHead>
                      <TableHead onClick={() => handleSort('createdBy')}>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContacts.map((contact) => (
                      <TableRow key={contact._id || contact.id} className="cursor-pointer hover:bg-muted/50">
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
      ) : (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-start overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Add New Contact</h2>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Close</Button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select value={formData.title} onValueChange={val => handleSelectChange("title", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                    <SelectItem value="Prof.">Prof.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input id="account" name="account" value={formData.account} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalFunction">Technical Function</Label>
                <Select value={formData.technicalFunction} onValueChange={val => handleSelectChange("technicalFunction", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technical function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="function">Function</Label>
                <Select value={formData.function} onValueChange={val => handleSelectChange("function", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactId">Contact ID</Label>
                <Input id="contactId" name="contactId" value={formData.contactId} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalId">External ID</Label>
                <Input id="externalId" name="externalId" value={formData.externalId} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={val => handleSelectChange("language", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input id="accountId" name="accountId" value={formData.accountId} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={val => handleSelectChange("status", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdBy">Created By</Label>
                <Input id="createdBy" name="createdBy" value={formData.createdBy} onChange={handleInputChange} />
              </div>
              <div className="col-span-2 flex justify-end space-x-4 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;