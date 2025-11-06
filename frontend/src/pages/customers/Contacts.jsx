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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ResizableTable from "@/components/table/ResizableTable";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { countries, getStatesForCountry } from "@/data/countriesStates";

const Contacts = () => {
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    mainContact: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    country: "India",
    state: "",
    department: "",
    accountId: "",
    accountName: "",
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
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [accountSearchResults, setAccountSearchResults] = useState([]);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const allColumns = [
    { key: "contactId", label: "Contact ID" },
    { key: "mainContact", label: "Main Contact" },
    { key: "status", label: "Status" },
    { key: "accountId", label: "Account ID" },
    { key: "accountName", label: "Account Name" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    { key: "address", label: "Address" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "department", label: "Department" }
  ];

  const storageKey = "contacts.visibleColumns";
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {};
    allColumns.forEach(c => (init[c.key] = true));
    return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === "refresh") fetchContacts();
      else if (a === "add-new") setShowForm(true);
      else if (a === "sort") setShowSortDialog(true);
      else if (a === "manage-columns") setShowColumnsDialog(true);
    };
    window.addEventListener("crm-toolbar-action", handler);
    return () => window.removeEventListener("crm-toolbar-action", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const states = getStatesForCountry(formData.country);
    setAvailableStates(states);
    if (states.length > 0 && !states.includes(formData.state)) {
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.country]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (accountSearchTerm.length > 1) {
        searchAccounts(accountSearchTerm);
      } else {
        setAccountSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [accountSearchTerm]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API_PREFIX}/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error.response?.data || error.message);
    }
  };

  const searchAccounts = async (query) => {
    try {
      const response = await axios.get(`${API_PREFIX}/contacts/search-accounts?q=${query}`);
      setAccountSearchResults(response.data);
      setShowAccountDropdown(true);
    } catch (error) {
      console.error("Error searching accounts:", error);
    }
  };

  // Removed contact-name search functionality

  const handleAccountSelect = async (account) => {
    const next = {
      ...formData,
      accountId: account.accountId,
      accountName: account.name,
    };
    setFormData(next);
    setAccountSearchTerm(account.name);
    setShowAccountDropdown(false);
    // No contact-name fetching
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

    if (!formData.mainContact || !formData.email) {
      alert("Main Contact and Email are required.");
      return;
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    try {
      const payload = { ...formData };
      await axios.post(`${API_PREFIX}/contacts`, payload);
      setShowForm(false);
      setFormData({
        mainContact: "",
        email: "",
        mobile: "",
        address: "",
        city: "",
        country: "India",
        state: "",
        department: "",
        accountId: "",
        accountName: "",
        status: "Active"
      });
      setAccountSearchTerm("");
      
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

  const filteredContacts = contacts.filter((contact) =>
    Object.values(contact).some((value) =>
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

  // Columns config for ResizableTable
  const columnsConfig = [
    { key: "contactId", label: "Contact ID", defaultWidth: 100},
    { key: "mainContact", label: "Contact Name", defaultWidth: 160 },
    { key: "status", label: "Status", defaultWidth: 100 },
    { key: "accountId", label: "Account ID", defaultWidth: 100 },
    { key: "accountName", label: "Account Name", defaultWidth: 130 },
    { key: "email", label: "Email", defaultWidth: 200, minWidth: 120 },
    { key: "mobile", label: "Mobile", defaultWidth: 120 },
    { key: "address", label: "Address", defaultWidth: 200, minWidth: 120 },
    { key: "country", label: "Country", defaultWidth: 100 },
    { key: "state", label: "State", defaultWidth: 120 },
    { key: "department", label: "Department", defaultWidth: 120 },
  ];

  const renderCell = (row, key) => {
    if (key === "mainContact") {
      return editingId === (row._id || row.id) ? (
        <Input value={editData.mainContact} onChange={(e) => updateEdit('mainContact', e.target.value)} />
      ) : (
        row.mainContact
      );
    }
    if (key === "department") {
      return editingId === (row._id || row.id) ? (
        <Input value={editData.department} onChange={(e) => updateEdit('department', e.target.value)} />
      ) : (
        row.department
      );
    }
    if (key === "status") {
      return <Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status}</Badge>;
    }
    if (key === "email") {
      return (
        <a href={`mailto:${row.email}`} className="text-primary hover:underline" title={row.email}>
          {row.email}
        </a>
      );
    }
    return row[key];
  };

  // Inline edit: Contact Name and Department
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const startEdit = (row) => {
    setEditingId(row._id || row.id);
    setEditData({
      mainContact: row.mainContact || "",
      department: row.department || "",
    });
  };
  const updateEdit = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));
  const saveEdit = async (row) => {
    try {
      const id = row._id;
      if (!id) throw new Error('Missing _id for contact update');
      const payload = Object.fromEntries(
        Object.entries(editData).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      await axios.put(`${API_PREFIX}/contacts/${id}`, payload);
      setEditingId(null);
      setEditData({});
      fetchContacts();
    } catch (e) {
      alert("Failed to update contact: " + (e.response?.data?.message || e.message));
    }
  };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  return (
    <div className="min-h-screen bg-background relative">
      {!showForm ? (
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
            <div className="table-scroll show-scrollbar relative overflow-auto max-h[calc(100vh-16rem)] focus:outline-none" tabIndex={0}>
              <ResizableTable
                columns={columnsConfig}
                data={paginatedContacts}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={renderCell}
                actions={{
                  header: 'Actions',
                  cell: (contact) => (
                    editingId === (contact._id || contact.id) ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(contact)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => startEdit(contact)} aria-label="Edit contact">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                  )
                }}
                minTableWidth={1000}
              />
              <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border mt-4 py-3 px-2 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedContacts.length)} of {sortedContacts.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
          <form onSubmit={handleSubmit}>
            <FormSection title="Basic Information">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="mainContact"> Contact Name <span className="text-red-500">*</span></Label>
                <Input
                  id="mainContact"
                  name="mainContact"
                  value={formData.mainContact}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                  required
                />
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
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
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
              <div className="space-y-2 lg:col-span-2 relative">
                <Label htmlFor="accountSearch">Account</Label>
                <div className="relative">
                  <Input
                    id="accountSearch"
                    value={accountSearchTerm}
                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                    onFocus={() => accountSearchResults.length > 0 && setShowAccountDropdown(true)}
                    placeholder="Type to search accounts..."
                  />
                  {showAccountDropdown && accountSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      {accountSearchResults.map((account) => (
                        <div
                          key={account._id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleAccountSelect(account)}
                        >
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {account.accountId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID (Auto-filled)</Label>
                <Input id="accountId" name="accountId" value={formData.accountId} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name (Auto-filled)</Label>
                <Input id="accountName" name="accountName" value={formData.accountName} readOnly className="bg-muted" />
              </div>
            </FormSection>

            <FormSection title="Location Details">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(val) => handleSelectChange("country", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
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
                      {availableStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" />
                )}
              </div>
            </FormSection>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Contact</Button>
            </div>
          </form>
        </FormCard>
      </div>
    )}
    <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sort</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Field</Label>
            <Select value={sortField} onValueChange={(v) => setSortField(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {allColumns.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={sortDirection} onValueChange={(v) => setSortDirection(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowSortDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => applySortSelection(sortField || "mainContact", sortDirection || "asc")}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-auto pr-2">
          {allColumns.map((col) => (
            <label key={col.key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isVisible(col.key)}
                onCheckedChange={(val) => setVisibleColumns((prev) => ({ ...prev, [col.key]: !!val }))}
              />
              {col.label}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowColumnsDialog(false)}>
            Close
          </Button>
          <Button onClick={() => { setShowColumnsDialog(false); }}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    </div>
  );
};

export default Contacts;
