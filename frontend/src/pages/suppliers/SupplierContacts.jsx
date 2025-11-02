import React, { useState, useEffect } from "react";
import axios from "axios";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
import { FormCard } from "@/components/forms/FormCard";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ResizableTable from "@/components/table/ResizableTable";
import { Search, ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { countries, getStatesForCountry } from "@/data/countriesStates";

const SupplierContacts = () => {
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    supplierId: "",
    state: "",
    city: "",
    country: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const itemsPerPage = 10;

  // Toolbar-driven UI state
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  // Manage columns
  const allColumns = [
    { key: "name", label: "Name" },
    { key: "supplierName", label: "Supplier" },
    { key: "state", label: "State" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "createdAt", label: "Created On" }
  ];
  const storageKey = "supplierContacts.visibleColumns";
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const initial = {};
    allColumns.forEach(c => { initial[c.key] = true; });
    return initial;
  });
  const isVisible = (key) => visibleColumns[key] !== false;

  // Fetch data from backend
  useEffect(() => {
    fetchContacts();
    fetchSuppliers();
  }, []);

  // Listen to global toolbar actions
  useEffect(() => {
    const handler = (e) => {
      const action = e?.detail?.action;
      if (action === "refresh") {
        fetchContacts();
      } else if (action === "add-new") {
        setShowForm(true);
        setEditingId(null);
        resetForm();
      } else if (action === "sort") {
        setShowSortDialog(true);
      } else if (action === "manage-columns") {
        setShowColumnsDialog(true);
      }
    };
    window.addEventListener("crm-toolbar-action", handler);
    document.addEventListener("crm-toolbar-action", handler);
    return () => {
      window.removeEventListener("crm-toolbar-action", handler);
      document.removeEventListener("crm-toolbar-action", handler);
    };
  }, []);

  // Persist column visibility
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/supplier-contacts");
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching supplier contacts:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      supplierId: "",
      state: "",
      city: "",
      country: ""
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.supplierId.trim()) newErrors.supplierId = "Supplier is required";
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSupplierChange = (supplierId) => {
    setFormData({ ...formData, supplierId });
    if (errors.supplierId) {
      setErrors({ ...errors, supplierId: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/supplier-contacts/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/supplier-contacts", formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error("Error saving supplier contact:", error);
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      supplierId: contact.supplierId._id,
      state: contact.state || "",
      city: contact.city || "",
      country: contact.country || ""
    });
    setEditingId(contact._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier contact?")) {
      try {
        await axios.delete(`http://localhost:5000/api/supplier-contacts/${id}`);
        fetchContacts();
      } catch (error) {
        console.error("Error deleting supplier contact:", error);
      }
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
    Object.values(contact).some(value => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v =>
          v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (!sortField) return 0;
    let aValue, bValue;

    if (sortField === "supplierName") {
      aValue = a.supplierId?.name || "";
      bValue = b.supplierId?.name || "";
    } else {
      aValue = a[sortField] || "";
      bValue = b[sortField] || "";
    }

    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title={editingId ? "Edit Supplier Contact" : "Add New Supplier Contact"}>
            <form onSubmit={handleSubmit}>
              <FormSection title="Supplier Contact Information">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter contact name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier *</Label>
                  <Select value={formData.supplierId} onValueChange={handleSupplierChange}>
                    <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && <p className="text-red-500 text-sm">{errors.supplierId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(val) => {
                      setFormData((prev) => ({ ...prev, country: val, state: "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  {getStatesForCountry(formData.country).length > 0 ? (
                    <Select
                      value={formData.state}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, state: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatesForCountry(formData.country).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                    />
                  )}
                </div>
              </FormSection>
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update Contact" : "Save Contact"}</Button>
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
              <CardTitle>Supplier Contacts ({sortedContacts.length})</CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px]">
              <ResizableTable
                columns={[
                  { key: 'name', label: 'Name', defaultWidth: 180 },
                  { key: 'supplierName', label: 'Supplier', defaultWidth: 200 },
                  { key: 'state', label: 'State', defaultWidth: 160 },
                  { key: 'city', label: 'City', defaultWidth: 160 },
                  { key: 'country', label: 'Country', defaultWidth: 160 },
                  { key: 'createdAt', label: 'Created On', defaultWidth: 200 },
                ]}
                data={paginatedContacts.map(c => ({
                  ...c,
                  supplierName: c.supplierId?.name,
                }))}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={(row, key) => {
                  if (key === 'createdAt') return formatDate(row.createdAt);
                  return row[key];
                }}
                actions={{
                  header: 'Actions',
                  cell: (contact) => (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(contact)} className="gap-1"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(contact._id)} className="gap-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )
                }}
                minTableWidth={1000}
              />
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
            <Button onClick={() => applySortSelection(sortField || "name", sortDirection || "asc")}>Apply</Button>
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
            <Button onClick={() => setShowColumnsDialog(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierContacts;
