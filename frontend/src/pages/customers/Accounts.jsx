import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_PREFIX } from "@/config/api";
import { FormCard } from "@/components/forms/FormCard";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResizableTable from "@/components/table/ResizableTable";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { countries, getStatesForCountry } from "@/data/countriesStates";

const Accounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    accountType: "",
    mainContact: "",
    country: "India",
    state: "",
    role: "",
    mobile: "",
    email: "",
    industryCode: "",
    buAssignment: "",
    horizontal: "",
    subVertical: "",
    vertical: "",
    valueAddedDepth: "",
    status: "Active"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);

  const allColumns = [
    { key: "accountId", label: "Account ID" },
    { key: "name", label: "Name" },
    { key: "accountType", label: "Account Type" },
    { key: "mainContact", label: "Main Contact" },
    { key: "status", label: "Status" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "role", label: "Role" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "industryCode", label: "Industry Code" },
    { key: "buAssignment", label: "BU Assignment" },
    { key: "horizontal", label: "Horizontal" },
    { key: "subVertical", label: "Sub Vertical" },
    { key: "vertical", label: "Vertical" },
    { key: "valueAddedDepth", label: "Value Added Depth" }
  ];

  const storageKey = "accounts.visibleColumns";
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const initial = {};
    allColumns.forEach(c => { initial[c.key] = true; });
    return initial;
  });
  const isVisible = (key) => visibleColumns[key] !== false;

  // Using shared ResizableTable for resize, sticky header, and truncation

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const action = e?.detail?.action;
      if (action === "refresh") fetchAccounts();
      else if (action === "add-new") setShowForm(true);
      else if (action === "sort") setShowSortDialog(true);
      else if (action === "manage-columns") setShowColumnsDialog(true);
    };
    window.addEventListener("crm-toolbar-action", handler);
    document.addEventListener("crm-toolbar-action", handler);
    return () => {
      window.removeEventListener("crm-toolbar-action", handler);
      document.removeEventListener("crm-toolbar-action", handler);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const states = getStatesForCountry(formData.country);
    setAvailableStates(states);
    if (states.length > 0 && !states.includes(formData.state)) {
      setFormData(prev => ({ ...prev, state: "" }));
    }
  }, [formData.country]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_PREFIX}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
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
    
    if (!formData.name || !formData.mainContact || !formData.email) {
      alert("Name, Main Contact, and Email are required fields");
      return;
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== "")
      );
      await axios.post(`${API_PREFIX}/accounts`, payload);
      setShowForm(false);
      setFormData({
        name: "",
        address: "",
        city: "",
        accountType: "",
        mainContact: "",
        country: "India",
        state: "",
        role: "",
        mobile: "",
        email: "",
        industryCode: "",
        buAssignment: "",
        horizontal: "",
        subVertical: "",
        vertical: "",
        valueAddedDepth: "",
        status: "Active"
      });
      fetchAccounts();
    } catch (error) {
      console.error("Error creating account:", error.response?.data || error.message);
      const backendError = error.response?.data?.error || error.response?.data?.message || error.message;
      alert(backendError || "Failed to create account");
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

  const filteredAccounts = accounts.filter(account =>
    Object.values(account).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + itemsPerPage);

  // Inline edit state and handlers
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const startEdit = (row) => {
    setEditingId(row._id || row.id);
    setEditData({
      name: row.name || "",
      accountType: row.accountType || "",
      role: row.role || "",
      industryCode: row.industryCode || "",
      buAssignment: row.buAssignment || "",
      horizontal: row.horizontal || "",
      subVertical: row.subVertical || "",
      vertical: row.vertical || "",
      valueAddedDepth: row.valueAddedDepth || "",
    });
  };
  const updateEdit = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));
  const saveEdit = async (row) => {
    try {
      const id = row._id;
      if (!id) throw new Error('Missing _id for account update');
      const payload = Object.fromEntries(
        Object.entries(editData).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      await axios.put(`${API_PREFIX}/accounts/${id}`, payload);
      setEditingId(null);
      setEditData({});
      fetchAccounts();
    } catch (e) {
      alert("Failed to update account: " + (e.response?.data?.message || e.message));
    }
  };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Account Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="Basic Information">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainContact">Main Contact <span className="text-red-500">*</span></Label>
                  <Input id="mainContact" name="mainContact" value={formData.mainContact} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile (10 digits)</Label>
                  <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="10 digit number" maxLength={10} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" value={formData.role} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={formData.accountType} onValueChange={(val) => handleSelectChange("accountType", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IE-Direct">IE-Direct</SelectItem>
                      <SelectItem value="IE-Indirect">IE-Indirect</SelectItem>
                      <SelectItem value="IT-Direct">IT-Direct</SelectItem>
                      <SelectItem value="IT-Indirect">IT-Indirect</SelectItem>
                      <SelectItem value="RI-Mixed">RI-Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormSection>

              <FormSection title="Location Details">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(val) => handleSelectChange("country", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  {availableStates.length > 0 ? (
                    <Select value={formData.state} onValueChange={(val) => handleSelectChange("state", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                </div>
              </FormSection>

              <FormSection title="Business Details">
                <div className="space-y-2">
                  <Label htmlFor="industryCode">Industry Code</Label>
                  <Input id="industryCode" name="industryCode" value={formData.industryCode} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buAssignment">BU Assignment</Label>
                  <Select value={formData.buAssignment} onValueChange={(val) => handleSelectChange("buAssignment", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BU assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Industry">Industry</SelectItem>
                      <SelectItem value="Energy & Power">Energy & Power</SelectItem>
                      <SelectItem value="Cooling">Cooling</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="IT Direkt">IT Direkt</SelectItem>
                      <SelectItem value="IT Hyperscale">IT Hyperscale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horizontal">Horizontal</Label>
                  <Select value={formData.horizontal} onValueChange={(val) => handleSelectChange("horizontal", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select horizontal" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="End Customer / Operator">End Customer / Operator</SelectItem>
                      <SelectItem value="System Integrator / EPC">System Integrator / EPC</SelectItem>
                      <SelectItem value="Machine Builder / OEM">Machine Builder / OEM</SelectItem>
                      <SelectItem value="Panel Builder (Automation)">Panel Builder (Automation)</SelectItem>
                      <SelectItem value="Switchgear Manufacturer (Power)">Switchgear Manufacturer (Power)</SelectItem>
                      <SelectItem value="Component / Hardware Manufacturer">Component / Hardware Manufacturer</SelectItem>
                      <SelectItem value="Education (Universities)">Education (Universities)</SelectItem>
                      <SelectItem value="Planner / Specifier">Planner / Specifier</SelectItem>
                      <SelectItem value="Distribution">Distribution</SelectItem>
                      <SelectItem value="Global Key Account">Global Key Account</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vertical">Vertical</Label>
                  <Select value={formData.vertical} onValueChange={(val) => handleSelectChange("vertical", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vertical" />
                    </SelectTrigger>
                   <SelectContent className="max-h-[300px]">
                        <SelectItem value="Industrial Automation">Industrial Automation</SelectItem>
                        <SelectItem value="Building Technology">Building Technology</SelectItem>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="Maritime">Maritime</SelectItem>
                        <SelectItem value="Rail">Rail</SelectItem>
                        <SelectItem value="Aviation">Aviation</SelectItem>
                        <SelectItem value="Process Industries">Process Industries</SelectItem>
                        <SelectItem value="Energy Storage">Energy Storage</SelectItem>
                        <SelectItem value="Power Grids">Power Grids</SelectItem>
                        <SelectItem value="Power Generation">Power Generation</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education & Research">Education & Research</SelectItem>
                        <SelectItem value="Gaming & Streaming">Gaming & Streaming</SelectItem>
                        <SelectItem value="Colocation">Colocation</SelectItem>
                        <SelectItem value="Hyperscale">Hyperscale</SelectItem>
                        <SelectItem value="Charging Infrastructure">Charging Infrastructure</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subVertical">Sub Vertical</Label>
                  <Select value={formData.subVertical} onValueChange={(val) => handleSelectChange("subVertical", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub vertical" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Manufacturer Parts">Manufacturer Parts</SelectItem>
                        <SelectItem value="Battery Production">Battery Production</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Telco Supplier">Telco Supplier</SelectItem>
                        <SelectItem value="Telco Provider">Telco Provider</SelectItem>
                        <SelectItem value="Water, Sewage">Water, Sewage</SelectItem>
                        <SelectItem value="Tunnels, Bridges">Tunnels, Bridges</SelectItem>
                        <SelectItem value="Shipyards">Shipyards</SelectItem>
                        <SelectItem value="Ports">Ports</SelectItem>
                        <SelectItem value="Airports">Airports</SelectItem>
                        <SelectItem value="Air Traffic">Air Traffic</SelectItem>
                        <SelectItem value="Aircrafts">Aircrafts</SelectItem>
                        <SelectItem value="Pharma">Pharma</SelectItem>
                        <SelectItem value="Chemical">Chemical</SelectItem>
                        <SelectItem value="Woodworking">Woodworking</SelectItem>
                        <SelectItem value="Pulp & Paper">Pulp & Paper</SelectItem>
                        <SelectItem value="Semiconductor">Semiconductor</SelectItem>
                        <SelectItem value="Metals">Metals</SelectItem>
                        <SelectItem value="Mining">Mining</SelectItem>
                        <SelectItem value="Oil & Gas - Downstream">Oil & Gas - Downstream</SelectItem>
                        <SelectItem value="Oil & Gas - Upstream">Oil & Gas - Upstream</SelectItem>
                        <SelectItem value="Battery">Battery</SelectItem>
                        <SelectItem value="Hydrogen">Hydrogen</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Transmission">Transmission</SelectItem>
                        <SelectItem value="Distribution">Distribution</SelectItem>
                        <SelectItem value="Solar">Solar</SelectItem>
                        <SelectItem value="Wind">Wind</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                        <SelectItem value="Manufacturer Vehicles, Trucks, Two-wheeler">Manufacturer Vehicles, Trucks, Two-wheeler</SelectItem>
                        <SelectItem value="Oil & Gas - Midstream">Oil & Gas - Midstream</SelectItem>
                        <SelectItem value="Defence">Defence</SelectItem>
                        <SelectItem value="Provider / Operator">Provider / Operator</SelectItem>
                        <SelectItem value="Supplier">Supplier</SelectItem>
                        <SelectItem value="Hydro">Hydro</SelectItem>
                        <SelectItem value="Nuclear Power">Nuclear Power</SelectItem>
                        <SelectItem value="Coal, Oil, Gas">Coal, Oil, Gas</SelectItem>
                      </SelectContent>

                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valueAddedDepth">Value Added Depth</Label>
                  <Input id="valueAddedDepth" name="valueAddedDepth" value={formData.valueAddedDepth} onChange={handleInputChange} />
                </div>
              </FormSection>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Account</Button>
              </div>
            </form>
          </FormCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Accounts ({sortedAccounts.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px] rounded-md border border-border">
              <ResizableTable
                columns={[
                  { key: 'accountId', label: 'Account ID', defaultWidth: 100 },
                  { key: 'name', label: 'Name', defaultWidth: 160 },
                  { key: 'accountType', label: 'Account Type', defaultWidth: 140 },
                  { key: 'mainContact', label: 'Main Contact', defaultWidth: 160 },
                  { key: 'status', label: 'Status', defaultWidth: 120 },
                  { key: 'address', label: 'Address', defaultWidth: 200, minWidth: 120 },
                  { key: 'city', label: 'City', defaultWidth: 120 },
                  { key: 'country', label: 'Country', defaultWidth: 120 },
                  { key: 'state', label: 'State', defaultWidth: 120 },
                  { key: 'role', label: 'Role', defaultWidth: 140 },
                  { key: 'mobile', label: 'Mobile', defaultWidth: 120 },
                  { key: 'email', label: 'Email', defaultWidth: 200, minWidth: 120 },
                  { key: 'industryCode', label: 'Industry Code', defaultWidth: 140 },
                  { key: 'buAssignment', label: 'BU Assignment', defaultWidth: 160 },
                  { key: 'horizontal', label: 'Horizontal', defaultWidth: 180 },
                  { key: 'subVertical', label: 'Sub Vertical', defaultWidth: 180 },
                  { key: 'vertical', label: 'Vertical', defaultWidth: 180 },
                  { key: 'valueAddedDepth', label: 'Value Added Depth', defaultWidth: 180 },
                ]}
                data={paginatedAccounts}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={(row, key) => {
                  if (key === 'name') {
                    return editingId === (row._id || row.id) ? (
                      <Input value={editData.name} onChange={(e) => updateEdit('name', e.target.value)} />
                    ) : row.name;
                  }
                  if (key === 'accountType') {
                    return editingId === (row._id || row.id) ? (
                      <Select value={editData.accountType} onValueChange={(v) => updateEdit('accountType', v)}>
                        <SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IE-Direct">IE-Direct</SelectItem>
                          <SelectItem value="IE-Indirect">IE-Indirect</SelectItem>
                          <SelectItem value="IT-Direct">IT-Direct</SelectItem>
                          <SelectItem value="IT-Indirect">IT-Indirect</SelectItem>
                          <SelectItem value="RI-Mixed">RI-Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : row.accountType;
                  }
                  if (key === 'status') {
                    return <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>{row.status}</Badge>;
                  }
                  if (key === 'role') {
                    return editingId === (row._id || row.id) ? (
                      <Input value={editData.role} onChange={(e) => updateEdit('role', e.target.value)} />
                    ) : row.role;
                  }
                  if (key === 'industryCode') {
                    return editingId === (row._id || row.id) ? (
                      <Input value={editData.industryCode} onChange={(e) => updateEdit('industryCode', e.target.value)} />
                    ) : row.industryCode;
                  }
                  if (key === 'buAssignment') {
                    return editingId === (row._id || row.id) ? (
                      <Select value={editData.buAssignment} onValueChange={(v) => updateEdit('buAssignment', v)}>
                        <SelectTrigger><SelectValue placeholder="Select BU assignment" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Industry">Industry</SelectItem>
                          <SelectItem value="Energy & Power">Energy & Power</SelectItem>
                          <SelectItem value="Cooling">Cooling</SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="IT Direkt">IT Direkt</SelectItem>
                          <SelectItem value="IT Hyperscale">IT Hyperscale</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : row.buAssignment;
                  }
                  if (key === 'horizontal') {
                    return editingId === (row._id || row.id) ? (
                      <Select value={editData.horizontal} onValueChange={(v) => updateEdit('horizontal', v)}>
                        <SelectTrigger><SelectValue placeholder="Select horizontal" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="End Customer / Operator">End Customer / Operator</SelectItem>
                          <SelectItem value="System Integrator / EPC">System Integrator / EPC</SelectItem>
                          <SelectItem value="Machine Builder / OEM">Machine Builder / OEM</SelectItem>
                          <SelectItem value="Panel Builder (Automation)">Panel Builder (Automation)</SelectItem>
                          <SelectItem value="Switchgear Manufacturer (Power)">Switchgear Manufacturer (Power)</SelectItem>
                          <SelectItem value="Component / Hardware Manufacturer">Component / Hardware Manufacturer</SelectItem>
                          <SelectItem value="Education (Universities)">Education (Universities)</SelectItem>
                          <SelectItem value="Planner / Specifier">Planner / Specifier</SelectItem>
                          <SelectItem value="Distribution">Distribution</SelectItem>
                          <SelectItem value="Global Key Account">Global Key Account</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : row.horizontal;
                  }
                  if (key === 'subVertical') {
                    return editingId === (row._id || row.id) ? (
                      <Select value={editData.subVertical} onValueChange={(v) => updateEdit('subVertical', v)}>
                        <SelectTrigger><SelectValue placeholder="Select sub vertical" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Manufacturer Parts">Manufacturer Parts</SelectItem>
                          <SelectItem value="Battery Production">Battery Production</SelectItem>
                          <SelectItem value="Agriculture">Agriculture</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Telco Supplier">Telco Supplier</SelectItem>
                          <SelectItem value="Telco Provider">Telco Provider</SelectItem>
                          <SelectItem value="Water, Sewage">Water, Sewage</SelectItem>
                          <SelectItem value="Tunnels, Bridges">Tunnels, Bridges</SelectItem>
                          <SelectItem value="Shipyards">Shipyards</SelectItem>
                          <SelectItem value="Ports">Ports</SelectItem>
                          <SelectItem value="Airports">Airports</SelectItem>
                          <SelectItem value="Air Traffic">Air Traffic</SelectItem>
                          <SelectItem value="Aircrafts">Aircrafts</SelectItem>
                          <SelectItem value="Pharma">Pharma</SelectItem>
                          <SelectItem value="Chemical">Chemical</SelectItem>
                          <SelectItem value="Woodworking">Woodworking</SelectItem>
                          <SelectItem value="Pulp & Paper">Pulp & Paper</SelectItem>
                          <SelectItem value="Semiconductor">Semiconductor</SelectItem>
                          <SelectItem value="Metals">Metals</SelectItem>
                          <SelectItem value="Mining">Mining</SelectItem>
                          <SelectItem value="Oil & Gas - Downstream">Oil & Gas - Downstream</SelectItem>
                          <SelectItem value="Oil & Gas - Upstream">Oil & Gas - Upstream</SelectItem>
                          <SelectItem value="Battery">Battery</SelectItem>
                          <SelectItem value="Hydrogen">Hydrogen</SelectItem>
                          <SelectItem value="Backend">Backend</SelectItem>
                          <SelectItem value="Frontend">Frontend</SelectItem>
                          <SelectItem value="Transmission">Transmission</SelectItem>
                          <SelectItem value="Distribution">Distribution</SelectItem>
                          <SelectItem value="Solar">Solar</SelectItem>
                          <SelectItem value="Wind">Wind</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                          <SelectItem value="Manufacturer Vehicles, Trucks, Two-wheeler">Manufacturer Vehicles, Trucks, Two-wheeler</SelectItem>
                          <SelectItem value="Oil & Gas - Midstream">Oil & Gas - Midstream</SelectItem>
                          <SelectItem value="Defence">Defence</SelectItem>
                          <SelectItem value="Provider / Operator">Provider / Operator</SelectItem>
                          <SelectItem value="Supplier">Supplier</SelectItem>
                          <SelectItem value="Hydro">Hydro</SelectItem>
                          <SelectItem value="Nuclear Power">Nuclear Power</SelectItem>
                          <SelectItem value="Coal, Oil, Gas">Coal, Oil, Gas</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : row.subVertical;
                  }
                  if (key === 'vertical') {
                    return editingId === (row._id || row.id) ? (
                      <Select value={editData.vertical} onValueChange={(v) => updateEdit('vertical', v)}>
                        <SelectTrigger><SelectValue placeholder="Select vertical" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="Industrial Automation">Industrial Automation</SelectItem>
                          <SelectItem value="Building Technology">Building Technology</SelectItem>
                          <SelectItem value="Automotive">Automotive</SelectItem>
                          <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                          <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="Logistics">Logistics</SelectItem>
                          <SelectItem value="Maritime">Maritime</SelectItem>
                          <SelectItem value="Rail">Rail</SelectItem>
                          <SelectItem value="Aviation">Aviation</SelectItem>
                          <SelectItem value="Process Industries">Process Industries</SelectItem>
                          <SelectItem value="Energy Storage">Energy Storage</SelectItem>
                          <SelectItem value="Power Grids">Power Grids</SelectItem>
                          <SelectItem value="Power Generation">Power Generation</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Education & Research">Education & Research</SelectItem>
                          <SelectItem value="Gaming & Streaming">Gaming & Streaming</SelectItem>
                          <SelectItem value="Colocation">Colocation</SelectItem>
                          <SelectItem value="Hyperscale">Hyperscale</SelectItem>
                          <SelectItem value="Charging Infrastructure">Charging Infrastructure</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : row.vertical;
                  }
                  if (key === 'valueAddedDepth') {
                    return editingId === (row._id || row.id) ? (
                      <Input value={editData.valueAddedDepth} onChange={(e) => updateEdit('valueAddedDepth', e.target.value)} />
                    ) : row.valueAddedDepth;
                  }
                  return row[key];
                }}
                actions={{
                  header: 'Actions',
                  cell: (account) => (
                    editingId === (account._id || account.id) ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(account)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => startEdit(account)} aria-label="Edit account">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                  )
                }}
                minTableWidth={1000}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedAccounts.length)} of {sortedAccounts.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sort</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <Select value={sortField} onValueChange={(v) => setSortField(v)}>
                <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  {allColumns.map(c => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={sortDirection} onValueChange={(v) => setSortDirection(v)}>
                <SelectTrigger><SelectValue placeholder="Select direction" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSortDialog(false)}>Cancel</Button>
            <Button onClick={() => applySortSelection(sortField || "accountId", sortDirection || "asc")}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

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

export default Accounts;
