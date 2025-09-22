import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const Leads = () => {
  const [showForm, setShowForm] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contactName: "",
    status: "In process",
    qualificationLevel: "Cold",
    source: "Website",
    category: "Retail",
    priority: "Medium",
    campaign: "",
    owner: "",
    follow_up_activity: "",
    accountInfo: {
      city: "",
      state: "",
      country: "",
      postalCode: "",
      language: ""
    },
    contactInfo: {
      phone: "",
      mobile: "",
      email: ""
    },
    notes: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'companyName', label: 'Company' },
    { key: 'contactName', label: 'Contact Name' },
    { key: 'status', label: 'Status' },
    { key: 'qualificationLevel', label: 'Qualification' },
    { key: 'source', label: 'Source' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'campaign', label: 'Campaign' },
    { key: 'owner', label: 'Owner' },
    { key: 'follow_up_activity', label: 'Follow-up' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];
  const storageKey = 'leads.visibleColumns';
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {}; allColumns.forEach(c => init[c.key] = true); return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchLeads();
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

  const fetchLeads = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leads");
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error.response?.data || error.message);
    }
  };

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowForm(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.accountInfo) {
      setFormData({
        ...formData,
        accountInfo: { ...formData.accountInfo, [name]: value }
      });
    } else if (name in formData.contactInfo) {
      setFormData({
        ...formData,
        contactInfo: { ...formData.contactInfo, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/leads", formData);
      setShowForm(false);
      setFormData({
        name: "",
        companyName: "",
        contactName: "",
        status: "In process",
        qualificationLevel: "Cold",
        source: "Website",
        category: "Retail",
        priority: "Medium",
        campaign: "",
        owner: "",
        follow_up_activity: "",
        accountInfo: {
          city: "",
          state: "",
          country: "",
          postalCode: "",
          language: ""
        },
        contactInfo: {
          phone: "",
          mobile: "",
          email: ""
        },
        notes: ""
      });
      fetchLeads();
    } catch (error) {
      alert("Failed to create lead: " + (error.response?.data?.message || error.message));
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

  const filteredLeads = leads.filter(lead =>
    Object.values(lead).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const variant = status === "Qualified" ? "default" : status === "In process" ? "secondary" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };
  const getPriorityBadge = (priority) => {
    const variant = priority === "High" ? "destructive" : priority === "Medium" ? "default" : "outline";
    return <Badge variant={variant}>{priority}</Badge>;
  };
  const getQualificationBadge = (level) => {
    const variant = level === "Hot" ? "destructive" : level === "Warm" ? "default" : "outline";
    return <Badge variant={variant}>{level}</Badge>;
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Lead Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="General Details">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={val => handleSelectChange("status", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In process">In Process</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualificationLevel">Qualification Level</Label>
                  <Select value={formData.qualificationLevel} onValueChange={val => handleSelectChange("qualificationLevel", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hot">Hot</SelectItem>
                      <SelectItem value="Warm">Warm</SelectItem>
                      <SelectItem value="Cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={val => handleSelectChange("source", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Trade Show">Trade Show</SelectItem>
                      <SelectItem value="Cold Call">Cold Call</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={val => handleSelectChange("category", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                      <SelectItem value="SMB">SMB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={val => handleSelectChange("priority", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign</Label>
                  <Input id="campaign" name="campaign" value={formData.campaign} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow_up_activity">Follow-up Activity</Label>
                  <Input id="follow_up_activity" name="follow_up_activity" value={formData.follow_up_activity} onChange={handleInputChange} />
                </div>
              </FormSection>
              <FormSection title="Location Information">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.accountInfo.city} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country/Region</Label>
                  <Input id="country" name="country" value={formData.accountInfo.country} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.accountInfo.state} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" value={formData.accountInfo.postalCode} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" name="language" value={formData.accountInfo.language} onChange={handleInputChange} />
                </div>
              </FormSection>
              <FormSection title="Contact Information">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.contactInfo.phone} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" name="mobile" value={formData.contactInfo.mobile} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.contactInfo.email} onChange={handleInputChange} />
                </div>
              </FormSection>
              <FormSection title="Notes">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="notes">Note</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={4} />
                </div>
              </FormSection>
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Lead</Button>
              </div>
            </form>
          </FormCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Leads ({sortedLeads.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
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
                    {isVisible('name') && <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>Name</TableHead>}
                    {isVisible('companyName') && <TableHead className="cursor-pointer" onClick={() => handleSort('companyName')}>Company</TableHead>}
                    {isVisible('contactName') && <TableHead className="cursor-pointer" onClick={() => handleSort('contactName')}>Contact Name</TableHead>}
                    {isVisible('status') && <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>}
                    {isVisible('qualificationLevel') && <TableHead className="cursor-pointer" onClick={() => handleSort('qualificationLevel')}>Qualification</TableHead>}
                    {isVisible('source') && <TableHead className="cursor-pointer" onClick={() => handleSort('source')}>Source</TableHead>}
                    {isVisible('category') && <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>Category</TableHead>}
                    {isVisible('priority') && <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>Priority</TableHead>}
                    {isVisible('campaign') && <TableHead className="cursor-pointer" onClick={() => handleSort('campaign')}>Campaign</TableHead>}
                    {isVisible('owner') && <TableHead className="cursor-pointer" onClick={() => handleSort('owner')}>Owner</TableHead>}
                    {isVisible('follow_up_activity') && <TableHead className="cursor-pointer" onClick={() => handleSort('follow_up_activity')}>Follow-up</TableHead>}
                    {isVisible('city') && <TableHead className="cursor-pointer" onClick={() => handleSort('city')}>City</TableHead>}
                    {isVisible('state') && <TableHead className="cursor-pointer" onClick={() => handleSort('state')}>State</TableHead>}
                    {isVisible('phone') && <TableHead className="cursor-pointer" onClick={() => handleSort('phone')}>Phone</TableHead>}
                    {isVisible('email') && <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>Email</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead) => (
                    <TableRow key={lead._id || lead.id} className="cursor-pointer hover:bg-muted/50">
                      {isVisible('name') && <TableCell className="font-medium">{lead.name}</TableCell>}
                      {isVisible('companyName') && <TableCell>{lead.companyName}</TableCell>}
                      {isVisible('contactName') && <TableCell>{lead.contactName}</TableCell>}
                      {isVisible('status') && <TableCell>{getStatusBadge(lead.status)}</TableCell>}
                      {isVisible('qualificationLevel') && <TableCell>{getQualificationBadge(lead.qualificationLevel)}</TableCell>}
                      {isVisible('source') && <TableCell>{lead.source}</TableCell>}
                      {isVisible('category') && <TableCell>{lead.category}</TableCell>}
                      {isVisible('priority') && <TableCell>{getPriorityBadge(lead.priority)}</TableCell>}
                      {isVisible('campaign') && <TableCell>{lead.campaign}</TableCell>}
                      {isVisible('owner') && <TableCell>{lead.owner}</TableCell>}
                      {isVisible('follow_up_activity') && <TableCell>{lead.follow_up_activity}</TableCell>}
                      {isVisible('city') && <TableCell>{lead.accountInfo?.city || ""}</TableCell>}
                      {isVisible('state') && <TableCell>{lead.accountInfo?.state || ""}</TableCell>}
                      {isVisible('phone') && <TableCell>{lead.contactInfo?.phone || ""}</TableCell>}
                      {isVisible('email') && (
                        <TableCell>
                          <a href={`mailto:${lead.contactInfo?.email || lead.email}`} className="text-primary hover:underline">
                            {lead.contactInfo?.email || lead.email}
                          </a>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedLeads.length)} of {sortedLeads.length} entries
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

export default Leads;