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
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SalesOrders = () => {
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    document_type: "",
    account: "",
    ship_in: "",
    external_ref: "",
    description: "",
    pricing_date: "",
    requsted_date: "",
    owner: "",
    sales_unit: "",
    sales_organisation: "",
    distribution_Channel: "",
    terrritory: "",
    status: "",
    amount: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'document_type', label: 'Document Type' },
    { key: 'account', label: 'Account' },
    { key: 'ship_in', label: 'Ship-To' },
    { key: 'external_ref', label: 'External Ref' },
    { key: 'description', label: 'Description' },
    { key: 'pricing_date', label: 'Pricing Date' },
    { key: 'requsted_date', label: 'Requested Date' },
    { key: 'owner', label: 'Owner' },
    { key: 'sales_unit', label: 'Sales Unit' },
    { key: 'sales_organisation', label: 'Sales Org' },
    { key: 'distribution_Channel', label: 'Distribution' },
    { key: 'terrritory', label: 'Territory' },
    { key: 'status', label: 'Status' },
    { key: 'amount', label: 'Amount' },
  ];
  const storageKey = 'orders.visibleColumns';
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {}; allColumns.forEach(c => init[c.key] = true); return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchOrders();
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

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
    }
  };

  const handleToolbarAction = (action) => {
    if (action === "add-new") {
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
    try {
      const submitData = { ...formData, amount: Number(formData.amount) || 0 };
      await axios.post("http://localhost:5000/api/orders", submitData);
      setShowForm(false);
      setFormData({
        document_type: "",
        account: "",
        ship_in: "",
        external_ref: "",
        description: "",
        pricing_date: "",
        requsted_date: "",
        owner: "",
        sales_unit: "",
        sales_organisation: "",
        distribution_Channel: "",
        terrritory: "",
        status: "",
        amount: ""
      });
      fetchOrders();
    } catch (error) {
      alert("Failed to create order: " + (error.response?.data?.message || error.message));
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

  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusColors = {
      Draft: "outline",
      Confirmed: "secondary",
      Processing: "default",
      Shipped: "destructive",
      Delivered: "destructive"
    };
    return <Badge variant={statusColors[status] || "outline"}>{status}</Badge>;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(amount));
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Sales Order Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="Order Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document_type">Document Type</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(val) => handleSelectChange("document_type", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales Order">Sales Order</SelectItem>
                        <SelectItem value="Quote">Quote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account">Account</Label>
                    <Input
                      id="account"
                      name="account"
                      value={formData.account}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ship_in">Ship-To Address</Label>
                    <div className="relative">
                      <Textarea
                        id="ship_in"
                        name="ship_in"
                        value={formData.ship_in}
                        onChange={handleInputChange}
                        placeholder="Enter shipping address"
                        rows={3}
                      />
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="external_ref">External Reference</Label>
                    <Input
                      id="external_ref"
                      name="external_ref"
                      value={formData.external_ref}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricing_date">Pricing Date</Label>
                    <div className="relative">
                      <Input
                        id="pricing_date"
                        name="pricing_date"
                        type="date"
                        value={formData.pricing_date}
                        onChange={handleInputChange}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requsted_date">Requested Date</Label>
                    <div className="relative">
                      <Input
                        id="requsted_date"
                        name="requsted_date"
                        type="date"
                        value={formData.requsted_date}
                        onChange={handleInputChange}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Responsibility and Assignment">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner</Label>
                    <Input
                      id="owner"
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_unit">Sales Unit</Label>
                    <Input
                      id="sales_unit"
                      name="sales_unit"
                      value={formData.sales_unit}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_organisation">Sales Organisation</Label>
                    <Input
                      id="sales_organisation"
                      name="sales_organisation"
                      value={formData.sales_organisation}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distribution_Channel">Distribution Channel</Label>
                    <Input
                      id="distribution_Channel"
                      name="distribution_Channel"
                      value={formData.distribution_Channel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="terrritory">Territory</Label>
                    <Input
                      id="terrritory"
                      name="terrritory"
                      value={formData.terrritory}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Order Status & Amount">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => handleSelectChange("status", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </FormSection>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Order</Button>
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
              <CardTitle>My Sales Orders ({sortedOrders.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
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
                    {isVisible('document_type') && <TableHead onClick={() => handleSort('document_type')}>Document Type</TableHead>}
                    {isVisible('account') && <TableHead onClick={() => handleSort('account')}>Account</TableHead>}
                    {isVisible('ship_in') && <TableHead onClick={() => handleSort('ship_in')}>Ship-To</TableHead>}
                    {isVisible('external_ref') && <TableHead onClick={() => handleSort('external_ref')}>External Ref</TableHead>}
                    {isVisible('description') && <TableHead onClick={() => handleSort('description')}>Description</TableHead>}
                    {isVisible('pricing_date') && <TableHead onClick={() => handleSort('pricing_date')}>Pricing Date</TableHead>}
                    {isVisible('requsted_date') && <TableHead onClick={() => handleSort('requsted_date')}>Requested Date</TableHead>}
                    {isVisible('owner') && <TableHead onClick={() => handleSort('owner')}>Owner</TableHead>}
                    {isVisible('sales_unit') && <TableHead onClick={() => handleSort('sales_unit')}>Sales Unit</TableHead>}
                    {isVisible('sales_organisation') && <TableHead onClick={() => handleSort('sales_organisation')}>Sales Org</TableHead>}
                    {isVisible('distribution_Channel') && <TableHead onClick={() => handleSort('distribution_Channel')}>Distribution</TableHead>}
                    {isVisible('terrritory') && <TableHead onClick={() => handleSort('terrritory')}>Territory</TableHead>}
                    {isVisible('status') && <TableHead onClick={() => handleSort('status')}>Status</TableHead>}
                    {isVisible('amount') && <TableHead onClick={() => handleSort('amount')}>Amount</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order._id || order.id}>
                      {isVisible('document_type') && <TableCell>{order.document_type || ""}</TableCell>}
                      {isVisible('account') && <TableCell>{order.account || ""}</TableCell>}
                      {isVisible('ship_in') && <TableCell>{order.ship_in || ""}</TableCell>}
                      {isVisible('external_ref') && <TableCell>{order.external_ref || ""}</TableCell>}
                      {isVisible('description') && <TableCell>{order.description || ""}</TableCell>}
                      {isVisible('pricing_date') && (
                        <TableCell>
                          {order.pricing_date ? new Date(order.pricing_date).toLocaleDateString() : ""}
                        </TableCell>
                      )}
                      {isVisible('requsted_date') && (
                        <TableCell>
                          {order.requsted_date ? new Date(order.requsted_date).toLocaleDateString() : ""}
                        </TableCell>
                      )}
                      {isVisible('owner') && <TableCell>{order.owner || ""}</TableCell>}
                      {isVisible('sales_unit') && <TableCell>{order.sales_unit || ""}</TableCell>}
                      {isVisible('sales_organisation') && <TableCell>{order.sales_organisation || ""}</TableCell>}
                      {isVisible('distribution_Channel') && <TableCell>{order.distribution_Channel || ""}</TableCell>}
                      {isVisible('terrritory') && <TableCell>{order.terrritory || ""}</TableCell>}
                      {isVisible('status') && <TableCell>{getStatusBadge(order.status)}</TableCell>}
                      {isVisible('amount') && <TableCell>{formatCurrency(order.amount)}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, sortedOrders.length)} of {sortedOrders.length} entries
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
          </CardContent>
        </Card>
      </div>

      {/* Sort Dialog */}
      <ShadDialog open={showSortDialog} onOpenChange={setShowSortDialog}>
        <ShadDialogContent>
          <ShadDialogHeader>
            <ShadDialogTitle>Sort</ShadDialogTitle>
          </ShadDialogHeader>
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
            <Button onClick={() => applySortSelection(sortField || 'document_type', sortDirection || 'asc')}>Apply</Button>
          </div>
        </ShadDialogContent>
      </ShadDialog>

      {/* Manage Columns Dialog */}
      <ShadDialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
        <ShadDialogContent>
          <ShadDialogHeader>
            <ShadDialogTitle>Manage Columns</ShadDialogTitle>
          </ShadDialogHeader>
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
        </ShadDialogContent>
      </ShadDialog>
    </div>
  );
};

export default SalesOrders;
