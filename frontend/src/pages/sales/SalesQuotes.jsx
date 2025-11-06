import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_PREFIX, UPLOADS_BASE_URL } from "@/config/api";
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
import { Search, ChevronLeft, ChevronRight, Calendar, FileText, Download, X, Pencil } from "lucide-react";
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SalesQuotes = () => {
  const [showForm, setShowForm] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [formData, setFormData] = useState({
    quoteId: "",
    document_type: "Sales Quote",
    account: "",
    contact: "",
    product: "",
    external_ref: "",
    description: "",
    date: new Date().toISOString().slice(0,10),
    validTo: "",
    owner: "user1",
    status: "Open",
    amount: ""
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'uploaded_pdf', label: 'Uploaded PDF' },
    { key: 'quoteId', label: 'Quote ID' },
    { key: 'document_type', label: 'Document Type' },
    { key: 'account', label: 'Account' },
    { key: 'contact', label: 'Contact' },
    { key: 'product', label: 'Product' },
    { key: 'date', label: 'Date' },
    { key: 'validTo', label: 'Valid To' },
    { key: 'owner', label: 'Owner' },
    { key: 'updatedAt', label: 'Changed On' },
    { key: 'status', label: 'Status' },
    { key: 'amount', label: 'Amount' },
  ];
  const storageKey = 'quotes.visibleColumns';
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {}; allColumns.forEach(c => init[c.key] = true); return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchQuotes();
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

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(`${API_PREFIX}/quotes`);
      setQuotes(response.data);
    } catch (error) {
      console.error("Error fetching quotes:", error.response?.data || error.message);
    }
  };

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
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

  const handlePdfFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must not exceed 5MB');
        return;
      }
      setPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        document_type: formData.document_type,
        account: formData.account,
        contact: formData.contact,
        product: formData.product,
        external_ref: formData.external_ref || undefined,
        description: formData.description || undefined,
        date: formData.date ? new Date(formData.date) : undefined,
        validTo: formData.validTo ? new Date(formData.validTo) : undefined,
        owner: formData.owner,
        status: formData.status,
        amount: formData.amount !== "" ? Number(formData.amount) : undefined,
      };

      // Use FormData if file is present
      if (pdfFile) {
        const formDataWithFile = new FormData();
        Object.keys(payload).forEach(key => {
          formDataWithFile.append(key, payload[key] ?? '');
        });
        formDataWithFile.append('pdf_file', pdfFile);
        await axios.post(`${API_PREFIX}/quotes`, formDataWithFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_PREFIX}/quotes`, payload);
      }

      setShowForm(false);
      setFormData({
        quoteId: "",
        document_type: "Sales Quote",
        account: "",
        contact: "",
        product: "",
        external_ref: "",
        description: "",
        date: new Date().toISOString().slice(0,10),
        validTo: "",
        owner: "user1",
        status: "Open",
        amount: ""
      });
      setPdfFile(null);
      setPdfFileName("");
      fetchQuotes();
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || error.message;
      alert("Failed to create quote: " + msg);
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

  const filteredQuotes = quotes.filter(quote => 
    Object.values(quote).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const totalPages = Math.ceil(sortedQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = sortedQuotes.slice(startIndex, startIndex + itemsPerPage);

  // Inline edit state & helpers
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editPdfFile, setEditPdfFile] = useState(null);
  const [editPdfFileName, setEditPdfFileName] = useState("");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerForId, setProductPickerForId] = useState(null);
  const [inlineProductQuery, setInlineProductQuery] = useState("");
  const [inlineProductResults, setInlineProductResults] = useState([]);

  const fmtDate = (d) => {
    if (!d) return "";
    try {
      const s = typeof d === 'string' ? d : new Date(d).toISOString();
      return s.slice(0, 10);
    } catch { return String(d); }
  };

  const startEdit = (row) => {
    setEditingId(row._id || row.id);
    setEditData({
      document_type: row.document_type || "Sales Quote",
      date: fmtDate(row.date) || new Date().toISOString().slice(0,10),
      validTo: fmtDate(row.validTo) || "",
      status: row.status || "Open",
      product: row.product || "",
      amount: row.amount ?? "",
    });
    setEditPdfFile(null);
    setEditPdfFileName("");
    setInlineProductQuery(row.product || "");
  };

  const updateEdit = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (row) => {
    try {
      const id = row._id || row.id;
      if (editPdfFile) {
        const fd = new FormData();
        fd.append('document_type', editData.document_type ?? 'Sales Quote');
        if (editData.date) fd.append('date', new Date(editData.date).toISOString());
        if (editData.validTo) fd.append('validTo', new Date(editData.validTo).toISOString());
        if (editData.status) fd.append('status', editData.status);
        if (editData.product) fd.append('product', editData.product);
        if (editData.amount !== undefined && editData.amount !== "") fd.append('amount', String(Number(editData.amount)));
        fd.append('pdf_file', editPdfFile);
        await axios.put(`${API_PREFIX}/quotes/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.put(`${API_PREFIX}/quotes/${id}`, {
          document_type: editData.document_type,
          date: editData.date ? new Date(editData.date) : undefined,
          validTo: editData.validTo ? new Date(editData.validTo) : undefined,
          status: editData.status,
          product: editData.product,
          amount: editData.amount === "" || editData.amount === undefined ? undefined : Number(editData.amount),
        });
      }
      setEditingId(null);
      setEditData({});
      setEditPdfFile(null);
      setEditPdfFileName("");
      setProductPickerOpen(false);
      setProductPickerForId(null);
      fetchQuotes();
    } catch (e) {
      alert("Failed to update quote: " + (e.response?.data || e.message));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setEditPdfFile(null);
    setEditPdfFileName("");
    setProductPickerOpen(false);
    setProductPickerForId(null);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "Open": "outline",
      "Below Minimum Amount": "secondary",
      "In Process": "default",
      "Order": "destructive",
      "No Order": "outline"
    };
    return <Badge variant={statusColors[status] || "outline"}>{status}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Live search states
  const [accountQuery, setAccountQuery] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState([]);
  const [showContactList, setShowContactList] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [showProductList, setShowProductList] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!accountQuery) { setAccountResults([]); return; }
      try {
        const res = await axios.get(`${API_PREFIX}/quotes/search/account?q=${encodeURIComponent(accountQuery)}`);
        setAccountResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [accountQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!contactQuery) { setContactResults([]); return; }
      try {
        const url = `${API_PREFIX}/quotes/search/contact?q=${encodeURIComponent(contactQuery)}${formData.account ? `&account=${encodeURIComponent(formData.account)}` : ''}`;
        const res = await axios.get(url);
        setContactResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [contactQuery, formData.account]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!productQuery) { setProductResults([]); return; }
      try {
        const res = await axios.get(`${API_PREFIX}/quotes/search/product?q=${encodeURIComponent(productQuery)}`);
        setProductResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  // Inline product live search for dialog
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!productPickerOpen || !inlineProductQuery) { setInlineProductResults([]); return; }
      try {
        const res = await axios.get(`${API_PREFIX}/quotes/search/product?q=${encodeURIComponent(inlineProductQuery)}`);
        setInlineProductResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [inlineProductQuery, productPickerOpen]);

  const selectAccount = (a) => {
    const name = a.name || a.accountName || "";
    setFormData(prev => ({ ...prev, account: name }));
    setAccountQuery(name);
    setShowAccountList(false);
  };
  const selectContact = (c) => {
    const name = c.name || c.mainContact || "";
    setFormData(prev => ({ ...prev, contact: name }));
    setContactQuery(name);
    setShowContactList(false);
  };
  const selectProduct = (p) => {
    const name = p.name || "";
    setFormData(prev => ({ ...prev, product: name }));
    setProductQuery(name);
    setShowProductList(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Sales Quote Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="Quote Details">
                {/* <div className="space-y-2">
                  <Label htmlFor="quoteId">Quote ID</Label>
                  <Input id="quoteId" name="quoteId" value={formData.quoteId || 'Will be generated on save'} disabled />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select value={formData.document_type} onValueChange={val => handleSelectChange("document_type", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales Order Request">Sales Order Request</SelectItem>
                      <SelectItem value="Sales Quote">Sales Quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" name="account" value={accountQuery} onChange={(e) => { setAccountQuery(e.target.value); setShowAccountList(true); setFormData(prev => ({ ...prev, account: e.target.value })); }} placeholder="Type to search account or enter manually" required />
                  {showAccountList && accountResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {accountResults.map((a, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectAccount(a)}>
                          <div className="font-medium">{a.name || a.accountName}</div>
                          <div className="text-xs text-muted-foreground">{[a.city,a.state,a.country].filter(Boolean).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="contact">Contact</Label>
                  <Input id="contact" name="contact" value={contactQuery} onChange={(e) => { setContactQuery(e.target.value); setShowContactList(true); setFormData(prev => ({ ...prev, contact: e.target.value })); }} placeholder="Type to search contact or enter manually" required />
                  {showContactList && contactResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {contactResults.map((c, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectContact(c)}>
                          <div className="font-medium">{c.name || c.mainContact}</div>
                          <div className="text-xs text-muted-foreground">{c.email} {c.mobile ? `• ${c.mobile}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="product">Product</Label>
                  <Input id="product" name="product" value={productQuery} onChange={(e) => { setProductQuery(e.target.value); setShowProductList(true); setFormData(prev => ({ ...prev, product: e.target.value })); }} placeholder="Type to search product or enter manually" required />
                  {showProductList && productResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {productResults.map((p, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectProduct(p)}>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To</Label>
                  <div className="relative">
                    <Input id="validTo" name="validTo" type="date" value={formData.validTo} onChange={handleInputChange} />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Upload PDF">
                <div className="space-y-2">
                  <Label htmlFor="pdf_upload">PDF Document</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Upload PDF</p>
                        <p className="text-xs text-muted-foreground">Max 5MB, PDF only</p>
                      </div>
                      <input
                        id="pdf_upload"
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('pdf_upload').click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                  {pdfFileName && (
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm text-muted-foreground truncate">{pdfFileName}</span>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Totals & Assignment">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="amount">Total</Label>
                  <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <ShadSelect value={formData.owner} onValueChange={val => handleSelectChange("owner", val)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select owner" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="user1">user1</ShadSelectItem>
                      <ShadSelectItem value="user2">user2</ShadSelectItem>
                      <ShadSelectItem value="user3">user3</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <ShadSelect value={formData.status} onValueChange={val => handleSelectChange("status", val)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select status" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Open">Open</ShadSelectItem>
                      <ShadSelectItem value="Below Minimum Amount">Below Minimum Amount</ShadSelectItem>
                      <ShadSelectItem value="In Process">In Process</ShadSelectItem>
                      <ShadSelectItem value="Order">Order</ShadSelectItem>
                      <ShadSelectItem value="No Order">No Order</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
              </FormSection>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Quote
                </Button>
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
              <CardTitle>My Sales Quotes ({sortedQuotes.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quotes..."
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
                  { key: 'uploaded_pdf', label: 'Uploaded PDF', defaultWidth: 160, minWidth: 140 },
                  { key: 'quoteId', label: 'Quote ID', defaultWidth: 100 },
                  { key: 'document_type', label: 'Document Type', defaultWidth: 160 },
                  { key: 'account', label: 'Account', defaultWidth: 160 },
                  { key: 'contact', label: 'Contact', defaultWidth: 160 },
                  { key: 'product', label: 'Product', defaultWidth: 180 },
                  { key: 'date', label: 'Date', defaultWidth: 120 },
                  { key: 'validTo', label: 'Valid To', defaultWidth: 140 },
                  { key: 'owner', label: 'Owner', defaultWidth: 120 },
                  { key: 'updatedAt', label: 'Changed On', defaultWidth: 180 },
                  { key: 'status', label: 'Status', defaultWidth: 140 },
                  { key: 'amount', label: 'Amount', defaultWidth: 140 },
                ]}
                data={paginatedQuotes}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={(row, key) => {
                  if (key === 'uploaded_pdf') {
                    return (
                      editingId === (row._id || row.id) ? (
                        <div className="flex items-center gap-2">
                          <input id={`edit_pdf_${row._id || row.id}`} type="file" accept=".pdf" className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (f.type !== 'application/pdf') { alert('Only PDF files are allowed'); return; }
                              if (f.size > 5 * 1024 * 1024) { alert('File size must not exceed 5MB'); return; }
                              setEditPdfFile(f);
                              setEditPdfFileName(f.name);
                            }}
                          />
                          <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`edit_pdf_${row._id || row.id}`).click()}>
                            {editPdfFileName ? 'Change PDF' : 'Upload PDF'}
                          </Button>
                          {editPdfFileName ? (
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{editPdfFileName}</span>
                          ) : (
                            row.uploaded_pdf ? (
                              <a href={`${UPLOADS_BASE_URL}/quotes_pdfs/${row.uploaded_pdf}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-primary hover:underline">
                                <Download className="h-4 w-4" />
                                <span className="text-sm">Current</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">No file</span>
                            )
                          )}
                        </div>
                      ) : (
                        row.uploaded_pdf ? (
                          <a href={`${UPLOADS_BASE_URL}/quotes_pdfs/${row.uploaded_pdf}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-primary hover:underline">
                            <Download className="h-4 w-4" />
                            <span className="text-sm">Quotation</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )
                      )
                    );
                  }
                  if (key === 'document_type') {
                    return (
                      editingId === (row._id || row.id) ? (
                        <ShadSelect value={editData.document_type} onValueChange={(v) => updateEdit('document_type', v)}>
                          <ShadSelectTrigger><ShadSelectValue placeholder="Select document type" /></ShadSelectTrigger>
                          <ShadSelectContent>
                            <ShadSelectItem value="Sales Order Request">Sales Order Request</ShadSelectItem>
                            <ShadSelectItem value="Sales Quote">Sales Quote</ShadSelectItem>
                          </ShadSelectContent>
                        </ShadSelect>
                      ) : (
                        row.document_type
                      )
                    );
                  }
                  if (key === 'product') {
                    return (
                      editingId === (row._id || row.id) ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{editData.product || row.product || '-'}</span>
                          <Button type="button" size="sm" variant="outline" onClick={() => { setProductPickerOpen(true); setProductPickerForId(row._id || row.id); setInlineProductQuery(editData.product || row.product || ''); }}>
                            Choose Product
                          </Button>
                        </div>
                      ) : (
                        row.product
                      )
                    );
                  }
                  if (key === 'date') {
                    return editingId === (row._id || row.id) ? (
                      <Input type="date" value={editData.date} onChange={(e) => updateEdit('date', e.target.value)} />
                    ) : (
                      row.date ? new Date(row.date).toLocaleDateString() : ''
                    );
                  }
                  if (key === 'validTo') {
                    return editingId === (row._id || row.id) ? (
                      <Input type="date" value={editData.validTo} onChange={(e) => updateEdit('validTo', e.target.value)} />
                    ) : (
                      row.validTo ? new Date(row.validTo).toLocaleDateString() : ''
                    );
                  }
                  if (key === 'updatedAt') return row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '';
                  if (key === 'status') {
                    return editingId === (row._id || row.id) ? (
                      <ShadSelect value={editData.status} onValueChange={(v) => updateEdit('status', v)}>
                        <ShadSelectTrigger><ShadSelectValue placeholder="Select status" /></ShadSelectTrigger>
                        <ShadSelectContent>
                          <ShadSelectItem value="Open">Open</ShadSelectItem>
                          <ShadSelectItem value="Below Minimum Amount">Below Minimum Amount</ShadSelectItem>
                          <ShadSelectItem value="In Process">In Process</ShadSelectItem>
                          <ShadSelectItem value="Order">Order</ShadSelectItem>
                          <ShadSelectItem value="No Order">No Order</ShadSelectItem>
                        </ShadSelectContent>
                      </ShadSelect>
                    ) : (
                      getStatusBadge(row.status)
                    );
                  }
                  if (key === 'amount') {
                    return editingId === (row._id || row.id) ? (
                      <Input type="number" value={editData.amount} onChange={(e) => updateEdit('amount', e.target.value)} />
                    ) : (
                      formatCurrency(row.amount)
                    );
                  }
                  return row[key];
                }}
                actions={{
                  header: 'Actions',
                  cell: (quote) => (
                    editingId === (quote._id || quote.id) ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(quote)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => startEdit(quote)} aria-label="Edit quote">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                  )
                }}
                minTableWidth={1000}
              />
            </div>
            <div className="flex items-center space-x-2 mt-4">
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
          </CardContent>
        </Card>

        {/* Sort Dialog */}
        <ShadDialog open={showSortDialog} onOpenChange={setShowSortDialog}>
          <ShadDialogContent>
            <ShadDialogHeader>
              <ShadDialogTitle>Sort Quotes</ShadDialogTitle>
            </ShadDialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <ShadSelect value={sortField} onValueChange={(value) => setSortField(value)}>
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select field to sort" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    {allColumns.map(col => (
                      <ShadSelectItem key={col.key} value={col.key}>{col.label}</ShadSelectItem>
                    ))}
                  </ShadSelectContent>
                </ShadSelect>
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <ShadSelect value={sortDirection} onValueChange={(value) => setSortDirection(value)}>
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select direction" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    <ShadSelectItem value="asc">Ascending</ShadSelectItem>
                    <ShadSelectItem value="desc">Descending</ShadSelectItem>
                  </ShadSelectContent>
                </ShadSelect>
              </div>
              <Button onClick={() => setShowSortDialog(false)} className="w-full">Apply Sort</Button>
            </div>
          </ShadDialogContent>
        </ShadDialog>

        {/* Manage Columns Dialog */}
        <ShadDialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
          <ShadDialogContent className="max-h-[600px] overflow-y-auto">
            <ShadDialogHeader>
              <ShadDialogTitle>Manage Columns</ShadDialogTitle>
            </ShadDialogHeader>
            <div className="space-y-3">
              {allColumns.map(col => (
                <div key={col.key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={col.key}
                    checked={visibleColumns[col.key] !== false}
                    onCheckedChange={(checked) => {
                      setVisibleColumns({
                        ...visibleColumns,
                        [col.key]: checked
                      });
                    }}
                  />
                  <Label htmlFor={col.key} className="cursor-pointer">{col.label}</Label>
                </div>
              ))}
            </div>
          </ShadDialogContent>
        </ShadDialog>

        {/* Product Picker Dialog (inline edit) */}
        <ShadDialog open={productPickerOpen} onOpenChange={(open) => { setProductPickerOpen(open); if (!open) setProductPickerForId(null); }}>
          <ShadDialogContent className="sm:max-w-md">
            <ShadDialogHeader>
              <ShadDialogTitle>Select Product</ShadDialogTitle>
            </ShadDialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search product..."
                  value={inlineProductQuery}
                  onChange={(e) => setInlineProductQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="border rounded max-h-64 overflow-auto">
                {inlineProductResults.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">Type to search products</div>
                ) : (
                  inlineProductResults.map((p, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setEditData(prev => ({ ...prev, product: p.name }));
                        setProductPickerOpen(false);
                        setProductPickerForId(null);
                      }}
                    >
                      <div className="font-medium text-sm">{p.name}</div>
                      {p.category && <div className="text-xs text-muted-foreground">{p.category}</div>}
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setProductPickerOpen(false); setProductPickerForId(null); }}>Close</Button>
                <Button onClick={() => { if (inlineProductQuery) { setEditData(prev => ({ ...prev, product: inlineProductQuery })); } setProductPickerOpen(false); setProductPickerForId(null); }}>Use "{inlineProductQuery || 'typed value'}"</Button>
              </div>
            </div>
          </ShadDialogContent>
        </ShadDialog>
      </div>
    </div>
  );
};

export default SalesQuotes;