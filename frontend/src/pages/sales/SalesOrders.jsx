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
import ResizableTable from "@/components/table/ResizableTable";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Calendar, Pencil } from "lucide-react";
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SalesOrders = () => {
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    orderId: "",
    document_type: "Standard Order",
    primaryContact: "",
    account: "",
    creationDate: new Date().toISOString().slice(0,10),
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
    { key: 'orderId', label: 'Order ID' },
    { key: 'document_type', label: 'Document Type' },
    { key: 'primaryContact', label: 'Primary Contact' },
    { key: 'account', label: 'Account' },
    { key: 'creationDate', label: 'Creation Date' },
    { key: 'amount', label: 'Total' },
    { key: 'deliveryStatus', label: 'Delivery Status' },
    { key: 'status', label: 'Status' },
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
      const response = await axios.get(`${API_PREFIX}/orders`);
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
      const submitData = {
        document_type: formData.document_type,
        primaryContact: formData.primaryContact,
        account: formData.account,
        creationDate: formData.creationDate ? new Date(formData.creationDate) : undefined,
        amount: formData.amount !== "" ? Number(formData.amount) : undefined,
      };
      await axios.post(`${API_PREFIX}/orders`, submitData);
      setShowForm(false);
      setFormData({
        orderId: "",
        document_type: "Standard Order",
        primaryContact: "",
        account: "",
        creationDate: new Date().toISOString().slice(0,10),
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
      Active: "default",
      Completed: "destructive"
    };
    return <Badge variant={statusColors[status] || "outline"}>{status}</Badge>;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(Number(amount));
  };

  // Live search for account/contact (like Opportunities)
  const [accountQuery, setAccountQuery] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState([]);
  const [showContactList, setShowContactList] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!accountQuery) { setAccountResults([]); return; }
      try {
        const res = await axios.get(`${API_PREFIX}/orders/search/account?q=${encodeURIComponent(accountQuery)}`);
        setAccountResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [accountQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!contactQuery) { setContactResults([]); return; }
      try {
        const res = await axios.get(`${API_PREFIX}/orders/search/contact?q=${encodeURIComponent(contactQuery)}`);
        setContactResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [contactQuery]);

  const selectAccount = (a) => {
    const name = a.name || a.accountName || "";
    setFormData(prev => ({ ...prev, account: name }));
    setAccountQuery(name);
    setShowAccountList(false);
  };
  const selectContact = (c) => {
    const name = c.name || c.mainContact || "";
    setFormData(prev => ({ ...prev, primaryContact: name }));
    setContactQuery(name);
    setShowContactList(false);
  };

  // Inline edit for deliveryStatus
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const startEdit = (row) => {
    setEditingId(row._id || row.id);
    setEditData({ 
      deliveryStatus: row.deliveryStatus || 'In Process',
      document_type: row.document_type || 'Standard Order',
      amount: row.amount ?? ''
    });
  };
  const updateEdit = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));
  const saveEdit = async (row) => {
    try {
      const id = row._id || row.id;
      await axios.put(`${API_PREFIX}/orders/${id}`, {
        deliveryStatus: editData.deliveryStatus,
        document_type: editData.document_type,
        amount: editData.amount === '' || editData.amount === undefined ? undefined : Number(editData.amount),
      });
      setEditingId(null);
      setEditData({});
      fetchOrders();
    } catch (e) {
      alert("Failed to update order: " + (e.response?.data || e.message));
    }
  };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Sales Order Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="Order Details">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input id="orderId" name="orderId" value={formData.orderId || 'Will be generated on save'} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select value={formData.document_type} onValueChange={(val) => handleSelectChange("document_type", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AT Advance payment">AT Advance payment</SelectItem>
                      <SelectItem value="AT Booklet delivery">AT Booklet delivery</SelectItem>
                      <SelectItem value="AT Credit Memo Requ.">AT Credit Memo Requ.</SelectItem>
                      <SelectItem value="AT CS Credit note">AT CS Credit note</SelectItem>
                      <SelectItem value="AT CS Direct debit">AT CS Direct debit</SelectItem>
                      <SelectItem value="AT CS Repair">AT CS Repair</SelectItem>
                      <SelectItem value="AT CS Service/Maintenance">AT CS Service/Maintenance</SelectItem>
                      <SelectItem value="AT Debit Note Requ.">AT Debit Note Requ.</SelectItem>
                      <SelectItem value="AT Forward order">AT Forward order</SelectItem>
                      <SelectItem value="AT Forward order">AT Forward order</SelectItem>
                      <SelectItem value="AT Forward order project">AT Forward order project</SelectItem>
                      <SelectItem value="AT Free delivery">AT Free delivery</SelectItem>
                      <SelectItem value="AT Online order">AT Online order</SelectItem>
                      <SelectItem value="AT return delivery">AT return delivery</SelectItem>
                      <SelectItem value="AT TG to GDC">AT TG to GDC</SelectItem>
                      <SelectItem value="Serviceauftrag">Serviceauftrag</SelectItem>
                      <SelectItem value="Standard Order">Standard Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input id="primaryContact" name="primaryContact" value={contactQuery} onChange={(e) => { setContactQuery(e.target.value); setShowContactList(true); setFormData(prev => ({ ...prev, primaryContact: e.target.value })); }} placeholder="Type to search contact or enter manually" required />
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
                <div className="space-y-2 relative">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" name="account" value={accountQuery} onChange={(e) => { setAccountQuery(e.target.value); setShowAccountList(true); setFormData(prev => ({ ...prev, account: e.target.value })); }} placeholder="Type to search account or enter manually" required />
                  {showAccountList && accountResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {accountResults.map((a, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectAccount(a)}>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{[a.city,a.state,a.country].filter(Boolean).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creationDate">Creation Date</Label>
                  <div className="relative">
                    <Input id="creationDate" name="creationDate" type="date" value={formData.creationDate} onChange={handleInputChange} />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="amount">Total</Label>
                  <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required />
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
              <ResizableTable
                columns={[
                  { key: 'orderId', label: 'Order ID', defaultWidth: 100 },
                  { key: 'document_type', label: 'Document Type', defaultWidth: 150 },
                  { key: 'primaryContact', label: 'Primary Contact', defaultWidth: 150 },
                  { key: 'account', label: 'Account', defaultWidth: 150 },
                  { key: 'creationDate', label: 'Creation Date', defaultWidth: 120 },
                  { key: 'amount', label: 'Total', defaultWidth: 140 },
                  { key: 'deliveryStatus', label: 'Delivery Status', defaultWidth: 120 },
                  { key: 'status', label: 'Status', defaultWidth: 120 },
                ]}
                data={paginatedOrders}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={(row, key) => {
                  if (key === 'document_type') {
                    return (
                      editingId === (row._id || row.id) ? (
                        <ShadSelect value={editData.document_type} onValueChange={(v) => updateEdit('document_type', v)}>
                          <ShadSelectTrigger><ShadSelectValue placeholder="Select document type" /></ShadSelectTrigger>
                          <ShadSelectContent>
                            <ShadSelectItem value="AT Advance payment">AT Advance payment</ShadSelectItem>
                            <ShadSelectItem value="AT Booklet delivery">AT Booklet delivery</ShadSelectItem>
                            <ShadSelectItem value="AT Credit Memo Requ.">AT Credit Memo Requ.</ShadSelectItem>
                            <ShadSelectItem value="AT CS Credit note">AT CS Credit note</ShadSelectItem>
                            <ShadSelectItem value="AT CS Direct debit">AT CS Direct debit</ShadSelectItem>
                            <ShadSelectItem value="AT CS Repair">AT CS Repair</ShadSelectItem>
                            <ShadSelectItem value="AT CS Service/Maintenance">AT CS Service/Maintenance</ShadSelectItem>
                            <ShadSelectItem value="AT Debit Note Requ.">AT Debit Note Requ.</ShadSelectItem>
                            <ShadSelectItem value="AT Forward order">AT Forward order</ShadSelectItem>
                            <ShadSelectItem value="AT Forward order project">AT Forward order project</ShadSelectItem>
                            <ShadSelectItem value="AT Free delivery">AT Free delivery</ShadSelectItem>
                            <ShadSelectItem value="AT Online order">AT Online order</ShadSelectItem>
                            <ShadSelectItem value="AT return delivery">AT return delivery</ShadSelectItem>
                            <ShadSelectItem value="AT TG to GDC">AT TG to GDC</ShadSelectItem>
                            <ShadSelectItem value="Serviceauftrag">Serviceauftrag</ShadSelectItem>
                            <ShadSelectItem value="Standard Order">Standard Order</ShadSelectItem>
                          </ShadSelectContent>
                        </ShadSelect>
                      ) : (
                        row.document_type || ''
                      )
                    );
                  }
                  if (key === 'creationDate') return row.creationDate ? new Date(row.creationDate).toLocaleDateString() : '';
                  if (key === 'amount') {
                    return editingId === (row._id || row.id) ? (
                      <Input type="number" value={editData.amount} onChange={(e) => updateEdit('amount', e.target.value)} />
                    ) : (
                      formatCurrency(row.amount)
                    );
                  }
                  if (key === 'deliveryStatus') {
                    return (
                      editingId === (row._id || row.id) ? (
                        <ShadSelect value={editData.deliveryStatus} onValueChange={(v) => updateEdit('deliveryStatus', v)}>
                          <ShadSelectTrigger><ShadSelectValue /></ShadSelectTrigger>
                          <ShadSelectContent>
                            <ShadSelectItem value="In Process">In Process</ShadSelectItem>
                            <ShadSelectItem value="Finished">Finished</ShadSelectItem>
                          </ShadSelectContent>
                        </ShadSelect>
                      ) : (
                        row.deliveryStatus || 'In Process'
                      )
                    );
                  }
                  if (key === 'status') return getStatusBadge(row.status || 'Active');
                  return row[key];
                }}
                actions={{
                  header: 'Actions',
                  cell: (order) => (
                    editingId === (order._id || order.id) ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(order)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => startEdit(order)} aria-label="Edit order">
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
