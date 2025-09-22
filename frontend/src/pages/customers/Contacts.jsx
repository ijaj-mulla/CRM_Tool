import React, { useState, useEffect } from "react";
import axios from "axios";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
import { FormCard } from "@/components/forms/FormCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'title', label: 'Title' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'account', label: 'Account' },
    { key: 'department', label: 'Department' },
    { key: 'technicalFunction', label: 'Technical Function' },
    { key: 'function', label: 'Function' },
    { key: 'contactId', label: 'Contact ID' },
    { key: 'externalId', label: 'External ID' },
    { key: 'language', label: 'Language' },
    { key: 'accountId', label: 'Account ID' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'createdBy', label: 'Created By' },
  ];
  const storageKey = 'contacts.visibleColumns';
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {}; allColumns.forEach(c => init[c.key] = true); return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchContacts();
      else if (a === 'add-new') setShowForm(true);
      else if (a === 'sort') setShowSortDialog(true);
      else if (a === 'manage-columns') setShowColumnsDialog(true);
    };
    window.addEventListener('crm-toolbar-action', handler);
    return () => window.removeEventListener('crm-toolbar-action', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

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

    if (!formData.title || !formData.contactId || !formData.name || !formData.email) {
      alert("Title, Contact ID, Name and Email are required.");
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
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      alert("Failed to create contact: " + backendError);
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

  const applySortSelection = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setShowSortDialog(false);
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
      { !showForm ? (
        <div className="p-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Contacts ({sortedContacts.length})</CardTitle>
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
              <div
                className="table-scroll show-scrollbar relative overflow-auto max-h-[calc(100vh-16rem)] focus:outline-none"
                tabIndex={0}
              >
                <Table className="min-w-[1800px]">
                  <TableHeader className="sticky top-0 bg-background z-20">
                    <TableRow>
                      {isVisible('title') && <TableHead onClick={() => handleSort('title')}>Title</TableHead>}
                      {isVisible('name') && <TableHead onClick={() => handleSort('name')}>Name</TableHead>}
                      {isVisible('phone') && <TableHead onClick={() => handleSort('phone')}>Phone</TableHead>}
                      {isVisible('mobile') && <TableHead onClick={() => handleSort('mobile')}>Mobile</TableHead>}
                      {isVisible('account') && <TableHead onClick={() => handleSort('account')}>Account</TableHead>}
                      {isVisible('department') && <TableHead onClick={() => handleSort('department')}>Department</TableHead>}
                      {isVisible('technicalFunction') && <TableHead onClick={() => handleSort('technicalFunction')}>Technical Function</TableHead>}
                      {isVisible('function') && <TableHead onClick={() => handleSort('function')}>Function</TableHead>}
                      {isVisible('contactId') && <TableHead onClick={() => handleSort('contactId')}>Contact ID</TableHead>}
                      {isVisible('externalId') && <TableHead onClick={() => handleSort('externalId')}>External ID</TableHead>}
                      {isVisible('language') && <TableHead onClick={() => handleSort('language')}>Language</TableHead>}
                      {isVisible('accountId') && <TableHead onClick={() => handleSort('accountId')}>Account ID</TableHead>}
                      {isVisible('email') && <TableHead onClick={() => handleSort('email')}>Email</TableHead>}
                      {isVisible('status') && <TableHead onClick={() => handleSort('status')}>Status</TableHead>}
                      {isVisible('jobTitle') && <TableHead onClick={() => handleSort('jobTitle')}>Job Title</TableHead>}
                      {isVisible('state') && <TableHead onClick={() => handleSort('state')}>State</TableHead>}
                      {isVisible('country') && <TableHead onClick={() => handleSort('country')}>Country</TableHead>}
                      {isVisible('createdBy') && <TableHead onClick={() => handleSort('createdBy')}>Created By</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContacts.map((contact) => (
                      <TableRow key={contact._id || contact.id} className="cursor-pointer hover:bg-muted/50">
                        {isVisible('title') && <TableCell>{contact.title}</TableCell>}
                        {isVisible('name') && <TableCell className="font-medium">{contact.name}</TableCell>}
                        {isVisible('phone') && <TableCell>{contact.phone}</TableCell>}
                        {isVisible('mobile') && <TableCell>{contact.mobile}</TableCell>}
                        {isVisible('account') && <TableCell>{contact.account}</TableCell>}
                        {isVisible('department') && <TableCell>{contact.department}</TableCell>}
                        {isVisible('technicalFunction') && <TableCell>{contact.technicalFunction}</TableCell>}
                        {isVisible('function') && <TableCell>{contact.function}</TableCell>}
                        {isVisible('contactId') && <TableCell>{contact.contactId}</TableCell>}
                        {isVisible('externalId') && <TableCell>{contact.externalId}</TableCell>}
                        {isVisible('language') && <TableCell>{contact.language}</TableCell>}
                        {isVisible('accountId') && <TableCell>{contact.accountId}</TableCell>}
                        {isVisible('email') && (
                          <TableCell>
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                              {contact.email}
                            </a>
                          </TableCell>
                        )}
                        {isVisible('status') && <TableCell>{getStatusBadge(contact.status)}</TableCell>}
                        {isVisible('jobTitle') && <TableCell>{contact.jobTitle}</TableCell>}
                        {isVisible('state') && <TableCell>{contact.state}</TableCell>}
                        {isVisible('country') && <TableCell>{contact.country}</TableCell>}
                        {isVisible('createdBy') && <TableCell>{contact.createdBy}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border mt-4 py-3 px-2 flex items-center justify-between">
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
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-6">
          <FormCard title="Contact Information">
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
          </FormCard>
        </div>
      )}

      {/* Sort Dialog */}
      <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sort</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <ShadSelect value={sortField} onValueChange={(v) => setSortField(v)}>
                <ShadSelectTrigger><ShadSelectValue placeholder="Select field" /></ShadSelectTrigger>
                <ShadSelectContent>
                  {allColumns.map(c => (
                    <ShadSelectItem key={c.key} value={c.key}>{c.label}</ShadSelectItem>
                  ))}
                </ShadSelectContent>
              </ShadSelect>
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <ShadSelect value={sortDirection} onValueChange={(v) => setSortDirection(v)}>
                <ShadSelectTrigger><ShadSelectValue placeholder="Select direction" /></ShadSelectTrigger>
                <ShadSelectContent>
                  <ShadSelectItem value="asc">Ascending</ShadSelectItem>
                  <ShadSelectItem value="desc">Descending</ShadSelectItem>
                </ShadSelectContent>
              </ShadSelect>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSortDialog(false)}>Cancel</Button>
            <Button onClick={() => applySortSelection(sortField || 'name', sortDirection || 'asc')}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Columns Dialog */}
      <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Columns</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-auto pr-2">
            {allColumns.map(col => (
              <label key={col.key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isVisible(col.key)}
                  onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, [col.key]: !!val }))}
                />
                {col.label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowColumnsDialog(false)}>Close</Button>
            <Button onClick={() => { setShowColumnsDialog(false); }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;