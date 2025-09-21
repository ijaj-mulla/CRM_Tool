import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    fetchLeads();
  }, []);

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
        <CRMToolbar title="Leads - New Lead" onAction={handleToolbarAction} />
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
      <CRMToolbar title="Leads" onAction={handleToolbarAction} />
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leads ({sortedLeads.length})</CardTitle>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>Name</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('companyName')}>Company</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('contactName')}>Contact Name</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('qualificationLevel')}>Qualification</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('source')}>Source</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>Category</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>Priority</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('campaign')}>Campaign</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('owner')}>Owner</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('follow_up_activity')}>Follow-up</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('city')}>City</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('state')}>State</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('phone')}>Phone</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead) => (
                    <TableRow key={lead._id || lead.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.companyName}</TableCell>
                      <TableCell>{lead.contactName}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>{getQualificationBadge(lead.qualificationLevel)}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>{lead.category}</TableCell>
                      <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                      <TableCell>{lead.campaign}</TableCell>
                      <TableCell>{lead.owner}</TableCell>
                      <TableCell>{lead.follow_up_activity}</TableCell>
                      <TableCell>{lead.accountInfo?.city || ""}</TableCell>
                      <TableCell>{lead.accountInfo?.state || ""}</TableCell>
                      <TableCell>{lead.contactInfo?.phone || ""}</TableCell>
                      <TableCell>
                        <a href={`mailto:${lead.contactInfo?.email || lead.email}`} className="text-primary hover:underline">
                          {lead.contactInfo?.email || lead.email}
                        </a>
                      </TableCell>
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
    </div>
  );
};

export default Leads;