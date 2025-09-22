import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

// Custom wrappers from your project
// Using simple sections without cards to match other pages' form style

const Opportunities = () => {
  const [showForm, setShowForm] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    account: "",
    opportunity_group: "",
    opportuni_type: "",
    industry: "",
    sub_industry: "",
    contact: "",
    source: "",
    amount: "",
    start_date: "",
    close_date: "",
    phase: "",
    probability: 10,
    forecaset_category: "",
    category: "",
    owner: "",
    notes: "",
    status: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'account', label: 'Account' },
    { key: 'opportunity_group', label: 'Opportunity Group' },
    { key: 'opportuni_type', label: 'Opportunity Type' },
    { key: 'industry', label: 'Industry' },
    { key: 'sub_industry', label: 'Sub Industry' },
    { key: 'contact', label: 'Contact' },
    { key: 'source', label: 'Source' },
    { key: 'amount', label: 'Amount' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'close_date', label: 'Close Date' },
    { key: 'phase', label: 'Phase' },
    { key: 'probability', label: 'Probability' },
    { key: 'forecaset_category', label: 'Forecast Category' },
    { key: 'category', label: 'Category' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status' },
  ];
  const storageKey = 'opportunities.visibleColumns';
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {}; allColumns.forEach(c => init[c.key] = true); return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchOpportunities();
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

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/opportunity");
      setOpportunities(response.data);
    } catch (error) {
      console.error("Error fetching opportunities:", error.response?.data || error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        contact: formData.contact !== "" ? Number(formData.contact) : undefined,
        amount: formData.amount !== "" ? Number(formData.amount) : undefined,
        probability:
          formData.probability !== "" && formData.probability !== null
            ? Number(formData.probability)
            : undefined,
        start_date: formData.start_date || null,
        close_date: formData.close_date || null,
      };

      // Basic required-field validation aligned with backend schema
      if (!payload.name || !payload.account || !payload.owner) {
        alert("Please fill in Name, Account, and Owner.");
        return;
      }
      if (payload.contact === undefined || Number.isNaN(payload.contact)) {
        alert("Contact must be a number.");
        return;
      }
      if (payload.amount === undefined || Number.isNaN(payload.amount)) {
        alert("Amount must be a valid number.");
        return;
      }

      await axios.post("http://localhost:5000/api/opportunity", payload);
      setShowForm(false);
      setFormData({
        name: "",
        account: "",
        opportunity_group: "",
        opportuni_type: "",
        industry: "",
        sub_industry: "",
        contact: "",
        source: "",
        amount: "",
        start_date: "",
        close_date: "",
        phase: "",
        probability: 10,
        forecaset_category: "",
        category: "",
        owner: "",
        notes: "",
        status: ""
      });
      fetchOpportunities();
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || error.message;
      alert("Failed to create opportunity: " + msg);
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

  const filteredOpportunities = opportunities.filter(opportunity =>
    Object.values(opportunity).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const totalPages = Math.ceil(sortedOpportunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOpportunities = sortedOpportunities.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const variant = status === "Active" ? "default" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getPhaseBadge = (phase) => {
    const phaseColors = {
      "Discovery": "outline",
      "Qualified": "secondary",
      "Proposal": "default",
      "Negotiation": "destructive"
    };
    return <Badge variant={phaseColors[phase] || "outline"}>{phase}</Badge>;
  };

  const getForecastBadge = (category) => {
    const variant = category === "Commit" ? "destructive" : category === "Best Case" ? "default" : "outline";
    return <Badge variant={variant}>{category}</Badge>;
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
        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold">Opportunity Information</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-4">
          <h3 className="text-base font-medium">General Details</h3>
          <hr className="border-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="account">Account</Label>
                <Input id="account" name="account" value={formData.account} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="opportunity_group">Opportunity Group</Label>
                <Input id="opportunity_group" name="opportunity_group" value={formData.opportunity_group} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="opportuni_type">Opportunity Type</Label>
                <Input id="opportuni_type" name="opportuni_type" value={formData.opportuni_type} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" value={formData.industry} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="sub_industry">Sub Industry</Label>
                <Input id="sub_industry" name="sub_industry" value={formData.sub_industry} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" name="contact" value={formData.contact} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" value={formData.source} onChange={handleInputChange} />
              </div>
            </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-medium">Dates & Financials</h3>
          <hr className="border-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="probability">Probability (%)</Label>
                <Input id="probability" name="probability" type="number" min="0" max="100" value={formData.probability} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="close_date">Close Date</Label>
                <Input id="close_date" name="close_date" type="date" value={formData.close_date} onChange={handleInputChange} />
              </div>
            </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-medium">Classification</h3>
          <hr className="border-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phase">Phase</Label>
                <Input id="phase" name="phase" value={formData.phase} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="forecaset_category">Forecast Category</Label>
                <Input id="forecaset_category" name="forecaset_category" value={formData.forecaset_category} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input id="status" name="status" value={formData.status} onChange={handleInputChange} />
              </div>
            </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-medium">Ownership & Notes</h3>
          <hr className="border-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Owner</Label>
                <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={4} />
              </div>
            </div>
        </section>

        <div className="flex justify-end space-x-4 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button type="submit">Save Opportunity</Button>
        </div>
      </form>
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
                <CardTitle>My Opportunities ({sortedOpportunities.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
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
                    {isVisible('name') && <TableHead onClick={() => handleSort('name')}>Name</TableHead>}
                    {isVisible('account') && <TableHead onClick={() => handleSort('account')}>Account</TableHead>}
                    {isVisible('opportunity_group') && <TableHead onClick={() => handleSort('opportunity_group')}>Opportunity Group</TableHead>}
                    {isVisible('opportuni_type') && <TableHead onClick={() => handleSort('opportuni_type')}>Opportunity Type</TableHead>}
                    {isVisible('industry') && <TableHead onClick={() => handleSort('industry')}>Industry</TableHead>}
                    {isVisible('sub_industry') && <TableHead onClick={() => handleSort('sub_industry')}>Sub Industry</TableHead>}
                    {isVisible('contact') && <TableHead onClick={() => handleSort('contact')}>Contact</TableHead>}
                    {isVisible('source') && <TableHead onClick={() => handleSort('source')}>Source</TableHead>}
                    {isVisible('amount') && <TableHead onClick={() => handleSort('amount')}>Amount</TableHead>}
                    {isVisible('start_date') && <TableHead onClick={() => handleSort('start_date')}>Start Date</TableHead>}
                    {isVisible('close_date') && <TableHead onClick={() => handleSort('close_date')}>Close Date</TableHead>}
                    {isVisible('phase') && <TableHead onClick={() => handleSort('phase')}>Phase</TableHead>}
                    {isVisible('probability') && <TableHead onClick={() => handleSort('probability')}>Probability</TableHead>}
                    {isVisible('forecaset_category') && <TableHead onClick={() => handleSort('forecaset_category')}>Forecast Category</TableHead>}
                    {isVisible('category') && <TableHead onClick={() => handleSort('category')}>Category</TableHead>}
                    {isVisible('owner') && <TableHead onClick={() => handleSort('owner')}>Owner</TableHead>}
                    {isVisible('status') && <TableHead onClick={() => handleSort('status')}>Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOpportunities.map((opportunity) => (
                    <TableRow key={opportunity._id || opportunity.id} className="cursor-pointer hover:bg-muted/50">
                      {isVisible('name') && <TableCell className="font-medium">{opportunity.name}</TableCell>}
                      {isVisible('account') && <TableCell>{opportunity.account}</TableCell>}
                      {isVisible('opportunity_group') && <TableCell>{opportunity.opportunity_group}</TableCell>}
                      {isVisible('opportuni_type') && <TableCell>{opportunity.opportuni_type}</TableCell>}
                      {isVisible('industry') && <TableCell>{opportunity.industry}</TableCell>}
                      {isVisible('sub_industry') && <TableCell>{opportunity.sub_industry}</TableCell>}
                      {isVisible('contact') && <TableCell>{opportunity.contact}</TableCell>}
                      {isVisible('source') && <TableCell>{opportunity.source}</TableCell>}
                      {isVisible('amount') && <TableCell className="font-medium">{formatCurrency(opportunity.amount)}</TableCell>}
                      {isVisible('start_date') && <TableCell>{opportunity.start_date ? new Date(opportunity.start_date).toLocaleDateString() : ""}</TableCell>}
                      {isVisible('close_date') && <TableCell>{opportunity.close_date ? new Date(opportunity.close_date).toLocaleDateString() : ""}</TableCell>}
                      {isVisible('phase') && <TableCell>{getPhaseBadge(opportunity.phase)}</TableCell>}
                      {isVisible('probability') && <TableCell>{opportunity.probability}%</TableCell>}
                      {isVisible('forecaset_category') && <TableCell>{getForecastBadge(opportunity.forecaset_category)}</TableCell>}
                      {isVisible('category') && <TableCell>{opportunity.category}</TableCell>}
                      {isVisible('owner') && <TableCell>{opportunity.owner}</TableCell>}
                      {isVisible('status') && <TableCell>{getStatusBadge(opportunity.status)}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedOpportunities.length)} of {sortedOpportunities.length} entries
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
          <DialogHeader><DialogTitle>Sort Opportunities</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sort by</Label>
              <ShadSelect value={sortField} onValueChange={(v) => setSortField(v)}>
                <ShadSelectTrigger><ShadSelectValue placeholder="Select field" /></ShadSelectTrigger>
                <ShadSelectContent>
                  {allColumns.map(col => (
                    <ShadSelectItem key={col.key} value={col.key}>{col.label}</ShadSelectItem>
                  ))}
                </ShadSelectContent>
              </ShadSelect>
            </div>
            <div>
              <Label>Direction</Label>
              <ShadSelect value={sortDirection} onValueChange={(v) => setSortDirection(v)}>
                <ShadSelectTrigger><ShadSelectValue /></ShadSelectTrigger>
                <ShadSelectContent>
                  <ShadSelectItem value="asc">Ascending</ShadSelectItem>
                  <ShadSelectItem value="desc">Descending</ShadSelectItem>
                </ShadSelectContent>
              </ShadSelect>
            </div>
            <Button onClick={() => setShowSortDialog(false)}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Columns Dialog */}
      <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Columns</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {allColumns.map(col => (
              <div key={col.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`col-${col.key}`}
                  checked={isVisible(col.key)}
                  onCheckedChange={(c) =>
                    setVisibleColumns({ ...visibleColumns, [col.key]: !!c })
                  }
                />
                <Label htmlFor={`col-${col.key}`}>{col.label}</Label>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowColumnsDialog(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Opportunities;
