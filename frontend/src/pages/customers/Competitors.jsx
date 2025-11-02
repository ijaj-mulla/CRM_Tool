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
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Trash2, Edit2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const Competitors = () => {
  const [showForm, setShowForm] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    postalCode: "",
    city: "",
    country: "",
    website: "",
    createdBy: "",
    status: "Active"
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
    { key: "address", label: "Address" },
    { key: "postalCode", label: "Postal Code" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "website", label: "Website" },
    { key: "createdBy", label: "Created By" },
    { key: "createdAt", label: "Created On" },
    { key: "status", label: "Status" }
  ];
  const storageKey = "competitors.visibleColumns";
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const initial = {};
    allColumns.forEach(c => { initial[c.key] = true; });
    return initial;
  });
  const isVisible = (key) => visibleColumns[key] !== false;

  // Fetch competitors from backend
  useEffect(() => {
    fetchCompetitors();
  }, []);

  // Listen to global toolbar actions
  useEffect(() => {
    const handler = (e) => {
      const action = e?.detail?.action;
      if (action === "refresh") {
        fetchCompetitors();
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

  const fetchCompetitors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/competitors");
      setCompetitors(response.data);
    } catch (error) {
      console.error("Error fetching competitors:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      postalCode: "",
      city: "",
      country: "",
      website: "",
      createdBy: "",
      status: "Active"
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.website.trim()) newErrors.website = "Website is required";
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
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
        await axios.put(`http://localhost:5000/api/competitors/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/competitors", formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchCompetitors();
    } catch (error) {
      console.error("Error saving competitor:", error);
    }
  };

  const handleEdit = (competitor) => {
    setFormData({
      name: competitor.name,
      address: competitor.address || "",
      postalCode: competitor.postalCode || "",
      city: competitor.city || "",
      country: competitor.country,
      website: competitor.website,
      createdBy: competitor.createdBy || "",
      status: competitor.status
    });
    setEditingId(competitor._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this competitor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/competitors/${id}`);
        fetchCompetitors();
      } catch (error) {
        console.error("Error deleting competitor:", error);
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

  const filteredCompetitors = competitors.filter(competitor =>
    Object.values(competitor).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const totalPages = Math.ceil(sortedCompetitors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompetitors = sortedCompetitors.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const variant = status === "Active" ? "default" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title={editingId ? "Edit Competitor" : "Add New Competitor"}>
            <form onSubmit={handleSubmit}>
              <FormSection title="Global Competitors">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter competitor name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Enter postal code"
                  />
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
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website *</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Enter website URL"
                    className={errors.website ? "border-red-500" : ""}
                  />
                  {errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdBy">Created By</Label>
                  <Input
                    id="createdBy"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    placeholder="Enter creator name or ID"
                  />
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
              </FormSection>
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update Competitor" : "Save Competitor"}</Button>
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
              <CardTitle>Global Competitors ({sortedCompetitors.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search competitors..."
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
                  { key: 'address', label: 'Address', defaultWidth: 220, minWidth: 140 },
                  { key: 'postalCode', label: 'Postal Code', defaultWidth: 140 },
                  { key: 'city', label: 'City', defaultWidth: 160 },
                  { key: 'country', label: 'Country', defaultWidth: 160 },
                  { key: 'website', label: 'Website', defaultWidth: 220, minWidth: 140 },
                  { key: 'createdBy', label: 'Created By', defaultWidth: 160 },
                  { key: 'createdAt', label: 'Created On', defaultWidth: 200 },
                  { key: 'status', label: 'Status', defaultWidth: 120 },
                ]}
                data={paginatedCompetitors}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={(row, key) => {
                  if (key === 'status') return getStatusBadge(row.status);
                  if (key === 'createdAt') return formatDate(row.createdAt);
                  if (key === 'website') return <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title={row.website}>{row.website}</a>;
                  return row[key];
                }}
                actions={{
                  header: 'Actions',
                  cell: (competitor) => (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(competitor)} className="gap-1"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(competitor._id)} className="gap-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )
                }}
                minTableWidth={1000}
              />
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedCompetitors.length)} of {sortedCompetitors.length} entries
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

export default Competitors;
