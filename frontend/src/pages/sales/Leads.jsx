import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_PREFIX } from "@/config/api";
import { FormCard } from "@/components/forms/FormCard";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ResizableTable from "@/components/table/ResizableTable";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { showNotification } from "@/utils/notifications";

const Leads = () => {
  const [showForm, setShowForm] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    status: "open",
    contact: "",
    account: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    email: "",
    department: "",
    owner: "user1",
    mobile: "",
    qualificationLevel: "cold",
    source: "email",
    priority: "normal",
    startDate: new Date().toISOString().slice(0,10),
    endDate: "",
    category: "demo category",
    followUpActivity: "visit"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'leadId', label: 'Lead ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'contact', label: 'Contact' },
    { key: 'account', label: 'Account' },
    { key: 'owner', label: 'Owner' },
    { key: 'qualificationLevel', label: 'Qualification' },
    { key: 'source', label: 'Source' },
    { key: 'priority', label: 'Priority' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'category', label: 'Category' },
    { key: 'followUpActivity', label: 'Follow-Up Activity' }
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
      const response = await axios.get(`${API_PREFIX}/leads`);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Live search states and handlers
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState([]);
  const [showContactList, setShowContactList] = useState(false);

  const [accountQuery, setAccountQuery] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);
  const [saveToMaster, setSaveToMaster] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!contactQuery) { setContactResults([]); return; }
      try {
        const url = `${API_PREFIX}/leads/search/contact?q=${encodeURIComponent(contactQuery)}${accountQuery ? `&account=${encodeURIComponent(accountQuery)}` : ''}`;
        const res = await axios.get(url);
        setContactResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [contactQuery, accountQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!accountQuery) { setAccountResults([]); return; }
      try {
        const res = await axios.get(`${API_PREFIX}/leads/search/account?q=${encodeURIComponent(accountQuery)}`);
        setAccountResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [accountQuery]);

  const selectContact = (c) => {
    setFormData(prev => ({
      ...prev,
      contact: c.name || "",
      email: c.email || prev.email,
      mobile: c.mobile || prev.mobile,
      department: c.department || prev.department,
      address: c.address || prev.address,
      city: c.city || prev.city,
      state: c.state || prev.state,
      country: c.country || prev.country,
      account: c.accountName || prev.account,
    }));
    setContactQuery(c.name || "");
    if (c.accountName) setAccountQuery(c.accountName);
    setShowContactList(false);
  };

  const selectAccount = (a) => {
    setFormData(prev => ({
      ...prev,
      account: a.name || "",
      address: a.address || prev.address,
      city: a.city || prev.city,
      state: a.state || prev.state,
      country: a.country || prev.country,
      postalCode: a.postalCode || prev.postalCode,
      contact: a.mainContact || prev.contact,
      email: a.email || prev.email,
      mobile: a.mobile || prev.mobile,
    }));
    setAccountQuery(a.name || "");
    if (a.mainContact) setContactQuery(a.mainContact);
    setShowAccountList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (saveToMaster) {
        // Create only Account (Contact creation skipped by design)
        const requiredMissing = !formData.account || !formData.contact || !formData.email;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || "");
        const mobileValid = !formData.mobile || /^\d{10}$/.test(formData.mobile);

        if (requiredMissing) {
          alert("To create an Account from lead, please provide: Account, Contact and Email.");
        } else if (!emailValid) {
          alert("Please enter a valid email to create the Account.");
        } else if (!mobileValid) {
          alert("Mobile must be exactly 10 digits if provided.");
        } else {
          const accountPayloadRaw = {
            name: formData.account,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            mainContact: formData.contact,
            mobile: formData.mobile,
            email: formData.email,
            status: 'Active'
          };
          const accountPayload = Object.fromEntries(
            Object.entries(accountPayloadRaw).filter(([_, v]) => v !== "" && v !== undefined)
          );
          try {
            await axios.post(`${API_PREFIX}/accounts`, accountPayload);
          } catch (accErr) {
            const msg = accErr.response?.data?.message || accErr.response?.data?.error || accErr.message;
            alert("Failed to create account: " + msg);
          }
        }
      }
      await axios.post(`${API_PREFIX}/leads`, formData);
      setShowForm(false);
      setFormData({
        name: "",
        status: "open",
        contact: "",
        account: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        email: "",
        department: "",
        owner: "user1",
        mobile: "",
        qualificationLevel: "cold",
        source: "email",
        priority: "normal",
        startDate: new Date().toISOString().slice(0,10),
        endDate: "",
        category: "demo category",
        followUpActivity: "visit"
      });
      setSaveToMaster(false);
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

  // Columns config for ResizableTable
  const columnsConfig = [
    { key: 'leadId', label: 'Lead ID', defaultWidth: 100 },
    { key: 'name', label: 'Name', defaultWidth: 150 },
    { key: 'status', label: 'Status', defaultWidth: 120 },
    { key: 'contact', label: 'Contact', defaultWidth: 150 },
    { key: 'account', label: 'Account', defaultWidth: 150 },
    { key: 'owner', label: 'Owner', defaultWidth: 100 },
    { key: 'qualificationLevel', label: 'Qualification', defaultWidth: 130 },
    { key: 'source', label: 'Source', defaultWidth: 150 },
    { key: 'priority', label: 'Priority', defaultWidth: 100 },
    { key: 'startDate', label: 'Start Date', defaultWidth: 120 },
    { key: 'endDate', label: 'End Date', defaultWidth: 120 },
    { key: 'category', label: 'Category', defaultWidth: 150 },
    { key: 'followUpActivity', label: 'Follow-Up Activity', defaultWidth: 150 },
  ];

  const renderCell = (row, key) => {
    if (key === 'name') {
      return editingId === (row._id || row.id) ? (
        <Input value={editData.name} onChange={(e) => updateEdit('name', e.target.value)} />
      ) : (
        row.name
      );
    }
    if (key === 'status') {
      return editingId === (row._id || row.id) ? (
        <Select value={editData.status} onValueChange={(v) => updateEdit('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in process">In Process</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        getStatusBadge(row.status)
      );
    }
    if (key === 'category') {
      return editingId === (row._id || row.id) ? (
        <Select value={editData.category} onValueChange={(v) => updateEdit('category', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Brochure request">Brochure request</SelectItem>
            <SelectItem value="Prospect for Consulting">Prospect for Consulting</SelectItem>
            <SelectItem value="Prospect for Product Sales">Prospect for Product Sales</SelectItem>
            <SelectItem value="Prospect for Service">Prospect for Service</SelectItem>
            <SelectItem value="Prospect for Training">Prospect for Training</SelectItem>
            <SelectItem value="Value Chain">Value Chain</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        row.category
      );
    }
    if (key === 'priority') return getPriorityBadge(row.priority);
    if (key === 'qualificationLevel') return getQualificationBadge(row.qualificationLevel);
    if (key === 'startDate') {
      return editingId === (row._id || row.id) ? (
        <Input type="date" value={editData.startDate} onChange={(e) => updateEdit('startDate', e.target.value)} />
      ) : (
        fmtDate(row.startDate)
      );
    }
    if (key === 'endDate') {
      return editingId === (row._id || row.id) ? (
        <Input type="date" value={editData.endDate} onChange={(e) => updateEdit('endDate', e.target.value)} />
      ) : (
        fmtDate(row.endDate)
      );
    }
    if (key === 'followUpActivity') {
      return editingId === (row._id || row.id) ? (
        <Select value={editData.followUpActivity} onValueChange={(v) => updateEdit('followUpActivity', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="visit">Visit</SelectItem>
            <SelectItem value="phone call">Phone Call</SelectItem>
            <SelectItem value="quotation">Quotation</SelectItem>
            <SelectItem value="brochure request">Brochure Request</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        row.followUpActivity
      );
    }
    return row[key];
  };

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (row) => {
    setEditingId(row._id || row.id);
    setEditData({
      name: row.name || "",
      status: row.status || "open",
      category: row.category || "Brochure request",
      startDate: fmtDate(row.startDate) || new Date().toISOString().slice(0,10),
      endDate: fmtDate(row.endDate) || "",
      followUpActivity: row.followUpActivity || "visit",
    });
  };

  const updateEdit = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (row) => {
    try {
      const id = row._id || row.id;
      await axios.put(`${API_PREFIX}/leads/${id}`, {
        ...editData,
        startDate: editData.startDate ? new Date(editData.startDate) : undefined,
        endDate: editData.endDate ? new Date(editData.endDate) : undefined,
      });
      setEditingId(null);
      setEditData({});
      fetchLeads();
    } catch (e) {
      alert("Failed to update lead: " + (e.response?.data || e.message));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const variant = s === "qualified" ? "default" : s === "in process" ? "secondary" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };
  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    const variant = p === "immediate" ? "destructive" : p === "urgent" ? "default" : "outline";
    return <Badge variant={variant}>{priority}</Badge>;
  };
  const getQualificationBadge = (level) => {
    const l = (level || '').toLowerCase();
    const variant = l === "hot" ? "destructive" : l === "warm" ? "default" : "outline";
    return <Badge variant={variant}>{level}</Badge>;
  };

  const fmtDate = (d) => {
    if (!d) return "";
    try {
      const s = typeof d === 'string' ? d : new Date(d).toISOString();
      return s.slice(0, 10);
    } catch {
      return String(d);
    }
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={val => handleSelectChange("status", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in process">In Process</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="account">Account</Label>
                  <Input
                    id="account"
                    name="account"
                    value={accountQuery}
                    onChange={(e) => { setAccountQuery(e.target.value); setShowAccountList(true); setFormData(prev => ({ ...prev, account: e.target.value })); }}
                    placeholder="Type to search account or enter manually"
                  />
                  {showAccountList && accountResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {accountResults.map((a, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectAccount(a)}>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{[a.city, a.state, a.country].filter(Boolean).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={contactQuery}
                    onChange={(e) => { setContactQuery(e.target.value); setShowContactList(true); setFormData(prev => ({ ...prev, contact: e.target.value })); }}
                    placeholder="Type to search contact or enter manually"
                  />
                  {showContactList && contactResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {contactResults.map((c, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectContact(c)}>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email} {c.mobile ? `• ${c.mobile}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Select value={formData.owner} onValueChange={val => handleSelectChange("owner", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">user1</SelectItem>
                      <SelectItem value="user2">user2</SelectItem>
                      <SelectItem value="user3">user3</SelectItem>
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
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
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
                    <SelectItem value="Customer event/workshop">Customer event/workshop</SelectItem>
                    <SelectItem value="Customer visit">Customer visit</SelectItem>
                    <SelectItem value="Direct mail">Direct mail</SelectItem>
                    <SelectItem value="ePocket">ePocket</SelectItem>
                    <SelectItem value="Ext. data sources (incl.ZoomInfo,Hover)">Ext. data sources (incl.ZoomInfo,Hover)</SelectItem>
                    <SelectItem value="External Partner">External Partner</SelectItem>
                    <SelectItem value="Further configurators">Further configurators</SelectItem>
                    <SelectItem value="Further Social Media">Further Social Media</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Meta (incl. Facebook, Instagram)">Meta (incl. Facebook, Instagram)</SelectItem>
                    <SelectItem value="Online Shop">Online Shop</SelectItem>
                    <SelectItem value="Potential Needs Analysis">Potential Needs Analysis</SelectItem>
                    <SelectItem value="RiPanel">RiPanel</SelectItem>
                    <SelectItem value="RiPower">RiPower</SelectItem>
                    <SelectItem value="RiTherm">RiTherm</SelectItem>
                    <SelectItem value="Rittal Application Center">Rittal Application Center</SelectItem>
                    <SelectItem value="Rittal Innovation Center">Rittal Innovation Center</SelectItem>
                    <SelectItem value="Rittal website (incl. Campaign)">Rittal website (incl. Campaign)</SelectItem>
                    <SelectItem value="Roadshow">Roadshow</SelectItem>
                    <SelectItem value="Telephone">Telephone</SelectItem>
                    <SelectItem value="Trade fair">Trade fair</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="X (Twitter)">X (Twitter)</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
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
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={val => handleSelectChange("category", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brochure request">Brochure request</SelectItem>
                      <SelectItem value="Prospect for Consulting">Prospect for Consulting</SelectItem>
                      <SelectItem value="Prospect for Product Sales">Prospect for Product Sales</SelectItem>
                      <SelectItem value="Prospect for Service">Prospect for Service</SelectItem>
                      <SelectItem value="Prospect for Training">Prospect for Training</SelectItem>
                      <SelectItem value="Value Chain">Value Chain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpActivity">Follow-Up Activity</Label>
                  <Select value={formData.followUpActivity} onValueChange={val => handleSelectChange("followUpActivity", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="phone call">Phone Call</SelectItem>
                      <SelectItem value="quotation">Quotation</SelectItem>
                      <SelectItem value="brochure request">Brochure Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormSection>
              <FormSection title="Location & Contact">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country/Region</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox
                    id="saveToMaster"
                    className="h-5 w-5"
                    checked={saveToMaster}
                    onCheckedChange={(v) => {
                      const val = !!v;
                      setSaveToMaster(val);
                      if (val) {
                        showNotification('success', '📌 Added to Account & Contacts ');
                      } else {
                        showNotification('info', 'Add to Account & Contacts disabled');
                      }
                    }}
                  />
                  <Label htmlFor="saveToMaster" className="text-sm font-semibold">
                    Add to Account & Contacts
                  </Label>
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
              <ResizableTable
                columns={columnsConfig}
                data={paginatedLeads}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={renderCell}
                actions={{
                  header: 'Actions',
                  cell: (lead) => (
                    editingId === (lead._id || lead.id) ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(lead)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => startEdit(lead)} aria-label="Edit lead">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                  )
                }}
                minTableWidth={1000}
              />
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