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
import { Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SalesQuotes = () => {
  const [showForm, setShowForm] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [formData, setFormData] = useState({
    document_type: "",
    account: "",
    contact: "",
    external_ref: "",
    description: "",
    date: "",
    financials: {
      payment_terms: "",
      incoterms: "",
      chance_of_success: 50,
      validTo: ""
    },
    owner: "",
    sales_unit: "",
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
    { key: 'contact', label: 'Contact' },
    { key: 'external_ref', label: 'External Ref' },
    { key: 'description', label: 'Description' },
    { key: 'date', label: 'Date' },
    { key: 'payment_terms', label: 'Payment Terms' },
    { key: 'incoterms', label: 'Incoterms' },
    { key: 'chance_of_success', label: 'Chance of Success' },
    { key: 'validTo', label: 'Valid To' },
    { key: 'owner', label: 'Owner' },
    { key: 'sales_unit', label: 'Sales Unit' },
    { key: 'terrritory', label: 'Territory' },
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
      const response = await axios.get("http://localhost:5000/api/quotes");
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
    if (name in formData.financials) {
      setFormData({
        ...formData,
        financials: { ...formData.financials, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, value) => {
    if (name in formData.financials) {
      setFormData({
        ...formData,
        financials: { ...formData.financials, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: formData.amount !== "" ? Number(formData.amount) : undefined,
        financials: {
          ...formData.financials,
          chance_of_success:
            formData.financials.chance_of_success !== "" && formData.financials.chance_of_success !== null
              ? Number(formData.financials.chance_of_success)
              : undefined,
          validTo: formData.financials.validTo || undefined,
        },
      };

      // Backend requires financials.validTo. Enforce minimal client-side validation
      if (!payload.financials?.validTo) {
        alert("Please select the 'Valid To' date.");
        return;
      }

      await axios.post("http://localhost:5000/api/quotes", payload);
      setShowForm(false);
      setFormData({
        document_type: "",
        account: "",
        contact: "",
        external_ref: "",
        description: "",
        date: "",
        financials: {
          payment_terms: "",
          incoterms: "",
          chance_of_success: 50,
          validTo: ""
        },
        owner: "",
        sales_unit: "",
        terrritory: "",
        status: "",
        amount: ""
      });
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

  const getStatusBadge = (status) => {
    const statusColors = {
      "Draft": "outline",
      "Sent": "secondary",
      "Under Review": "default",
      "Approved": "destructive"
    };
    return <Badge variant={statusColors[status] || "outline"}>{status}</Badge>;
  };

  const getChanceBadge = (chance) => {
    let label = chance;
    let value = chance;
    if (typeof chance === "number") {
      if (chance >= 76) label = "High";
      else if (chance >= 26) label = "Medium";
      else label = "Low";
    }
    const variant = label === "High" ? "destructive" : label === "Medium" ? "default" : "outline";
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Sales Quote Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="Quote Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="account">Account</Label>
                    <Input id="account" name="account" value={formData.account} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input id="contact" name="contact" value={formData.contact} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="external_ref">External Reference</Label>
                    <Input id="external_ref" name="external_ref" value={formData.external_ref} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
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
                </div>
              </FormSection>

              <FormSection title="Financial & Commercial Terms">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select value={formData.financials.payment_terms} onValueChange={val => handleSelectChange("payment_terms", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incoterms">Incoterms</Label>
                    <Select value={formData.financials.incoterms} onValueChange={val => handleSelectChange("incoterms", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incoterms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                        <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                        <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                        <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                        <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chance_of_success">Chance of Success (%)</Label>
                    <Input id="chance_of_success" name="chance_of_success" type="number" min="0" max="100" value={formData.financials.chance_of_success} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validTo">Valid To</Label>
                    <div className="relative">
                      <Input id="validTo" name="validTo" type="date" value={formData.financials.validTo} onChange={handleInputChange} />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Responsibility & Assignment">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner</Label>
                    <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_unit">Sales Unit</Label>
                    <Select value={formData.sales_unit} onValueChange={val => handleSelectChange("sales_unit", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enterprise Sales">Enterprise Sales</SelectItem>
                        <SelectItem value="SMB Sales">SMB Sales</SelectItem>
                        <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                        <SelectItem value="Digital Solutions">Digital Solutions</SelectItem>
                        <SelectItem value="Analytics Team">Analytics Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="terrritory">Territory</Label>
                    <Select value={formData.terrritory} onValueChange={val => handleSelectChange("terrritory", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select territory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="South America">South America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                        <SelectItem value="Middle East & Africa">Middle East & Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={val => handleSelectChange("status", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {isVisible('document_type') && <TableHead className="cursor-pointer" onClick={() => handleSort('document_type')}>Document Type</TableHead>}
                    {isVisible('account') && <TableHead className="cursor-pointer" onClick={() => handleSort('account')}>Account</TableHead>}
                    {isVisible('contact') && <TableHead className="cursor-pointer" onClick={() => handleSort('contact')}>Contact</TableHead>}
                    {isVisible('external_ref') && <TableHead className="cursor-pointer" onClick={() => handleSort('external_ref')}>External Ref</TableHead>}
                    {isVisible('description') && <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>Description</TableHead>}
                    {isVisible('date') && <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>Date</TableHead>}
                    {isVisible('payment_terms') && <TableHead className="cursor-pointer" onClick={() => handleSort('payment_terms')}>Payment Terms</TableHead>}
                    {isVisible('incoterms') && <TableHead className="cursor-pointer" onClick={() => handleSort('incoterms')}>Incoterms</TableHead>}
                    {isVisible('chance_of_success') && <TableHead className="cursor-pointer" onClick={() => handleSort('chance_of_success')}>Chance of Success</TableHead>}
                    {isVisible('validTo') && <TableHead className="cursor-pointer" onClick={() => handleSort('validTo')}>Valid To</TableHead>}
                    {isVisible('owner') && <TableHead className="cursor-pointer" onClick={() => handleSort('owner')}>Owner</TableHead>}
                    {isVisible('sales_unit') && <TableHead className="cursor-pointer" onClick={() => handleSort('sales_unit')}>Sales Unit</TableHead>}
                    {isVisible('terrritory') && <TableHead className="cursor-pointer" onClick={() => handleSort('terrritory')}>Territory</TableHead>}
                    {isVisible('status') && <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>}
                    {isVisible('amount') && <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>Amount</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuotes.map((quote) => (
                    <TableRow key={quote._id || quote.id} className="cursor-pointer hover:bg-muted/50">
                      {isVisible('document_type') && <TableCell className="font-medium">{quote.document_type}</TableCell>}
                      {isVisible('account') && <TableCell>{quote.account}</TableCell>}
                      {isVisible('contact') && <TableCell>{quote.contact}</TableCell>}
                      {isVisible('external_ref') && <TableCell>{quote.external_ref}</TableCell>}
                      {isVisible('description') && <TableCell className="max-w-xs truncate">{quote.description}</TableCell>}
                      {isVisible('date') && <TableCell>{quote.date ? new Date(quote.date).toLocaleDateString() : ""}</TableCell>}
                      {isVisible('payment_terms') && <TableCell>{quote.financials?.payment_terms}</TableCell>}
                      {isVisible('incoterms') && <TableCell>{quote.financials?.incoterms}</TableCell>}
                      {isVisible('chance_of_success') && <TableCell>{getChanceBadge(quote.financials?.chance_of_success)}</TableCell>}
                      {isVisible('validTo') && <TableCell>{quote.financials?.validTo ? new Date(quote.financials.validTo).toLocaleDateString() : ""}</TableCell>}
                      {isVisible('owner') && <TableCell>{quote.owner}</TableCell>}
                      {isVisible('sales_unit') && <TableCell>{quote.sales_unit}</TableCell>}
                      {isVisible('terrritory') && <TableCell>{quote.terrritory}</TableCell>}
                      {isVisible('status') && <TableCell>{getStatusBadge(quote.status)}</TableCell>}
                      {isVisible('amount') && <TableCell className="font-medium">{formatCurrency(quote.amount)}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedQuotes.length)} of {sortedQuotes.length} entries
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

export default SalesQuotes;