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

const Products = () => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    category: "",
    unitOfMeasure: ""
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
    { key: "id", label: "ID" },
    { key: "category", label: "Category" },
    { key: "unitOfMeasure", label: "Unit of Measure" },
    { key: "createdAt", label: "Created On" }
  ];
  const storageKey = "products.visibleColumns";
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const initial = {};
    allColumns.forEach(c => { initial[c.key] = true; });
    return initial;
  });
  const isVisible = (key) => visibleColumns[key] !== false;

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen to global toolbar actions
  useEffect(() => {
    const handler = (e) => {
      const action = e?.detail?.action;
      if (action === "refresh") {
        fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      id: "",
      category: "",
      unitOfMeasure: ""
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.id.trim()) newErrors.id = "ID is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.unitOfMeasure.trim()) newErrors.unitOfMeasure = "Unit of Measure is required";
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
        await axios.put(`http://localhost:5000/api/products/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/products", formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error.response?.data?.error || error.message;
      if (errorMessage?.includes("duplicate") || errorMessage?.includes("E11000")) {
        setErrors({ id: "Product ID already exists" });
      } else {
        setErrors({ submit: errorMessage || "Failed to save product" });
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      id: product.id,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
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

  const filteredProducts = products.filter(product =>
    Object.values(product).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title={editingId ? "Edit Product" : "Add New Product"}>
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}
              <FormSection title="Product Information">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">ID *</Label>
                  <Input
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="Enter product ID"
                    className={errors.id ? "border-red-500" : ""}
                    disabled={editingId ? true : false}
                  />
                  {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    className={errors.category ? "border-red-500" : ""}
                  />
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
                  <Input
                    id="unitOfMeasure"
                    name="unitOfMeasure"
                    value={formData.unitOfMeasure}
                    onChange={handleInputChange}
                    placeholder="Enter unit of measure (e.g., kg, ltr, pcs)"
                    className={errors.unitOfMeasure ? "border-red-500" : ""}
                  />
                  {errors.unitOfMeasure && <p className="text-red-500 text-sm">{errors.unitOfMeasure}</p>}
                </div>
              </FormSection>
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update Product" : "Save Product"}</Button>
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
              <CardTitle>Products ({sortedProducts.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
                  { key: 'id', label: 'ID', defaultWidth: 140, minWidth: 120 },
                  { key: 'category', label: 'Category', defaultWidth: 180 },
                  { key: 'unitOfMeasure', label: 'Unit of Measure', defaultWidth: 180 },
                  { key: 'createdAt', label: 'Created On', defaultWidth: 200 },
                ]}
                data={paginatedProducts}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={(row, key) => {
                  if (key === 'createdAt') return formatDate(row.createdAt);
                  return row[key];
                }}
                actions={{
                  header: 'Actions',
                  cell: (product) => (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="gap-1"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)} className="gap-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )
                }}
                minTableWidth={1000}
              />
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} entries
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

export default Products;
