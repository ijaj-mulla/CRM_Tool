import React, { useState, useEffect } from "react";
import axios from "axios";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const Opportunities = () => {
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/opportunity");
      setOpportunities(response.data);
    } catch (error) {
      console.error("Error fetching opportunities:", error.response?.data || error.message);
    }
  };

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowModal(true);
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
      await axios.post("http://localhost:5000/api/opportunity", formData);
      setShowModal(false);
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
      alert("Failed to create opportunity: " + (error.response?.data?.message || error.message));
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

  return (
    <div className="min-h-screen bg-background">
      <CRMToolbar title="Opportunities" onAction={handleToolbarAction} />
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Opportunities ({sortedOpportunities.length})</CardTitle>
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
                    <TableHead onClick={() => handleSort('name')}>Name</TableHead>
                    <TableHead onClick={() => handleSort('account')}>Account</TableHead>
                    <TableHead onClick={() => handleSort('opportunity_group')}>Opportunity Group</TableHead>
                    <TableHead onClick={() => handleSort('opportuni_type')}>Opportunity Type</TableHead>
                    <TableHead onClick={() => handleSort('industry')}>Industry</TableHead>
                    <TableHead onClick={() => handleSort('sub_industry')}>Sub Industry</TableHead>
                    <TableHead onClick={() => handleSort('contact')}>Contact</TableHead>
                    <TableHead onClick={() => handleSort('source')}>Source</TableHead>
                    <TableHead onClick={() => handleSort('amount')}>Amount</TableHead>
                    <TableHead onClick={() => handleSort('start_date')}>Start Date</TableHead>
                    <TableHead onClick={() => handleSort('close_date')}>Close Date</TableHead>
                    <TableHead onClick={() => handleSort('phase')}>Phase</TableHead>
                    <TableHead onClick={() => handleSort('probability')}>Probability</TableHead>
                    <TableHead onClick={() => handleSort('forecaset_category')}>Forecast Category</TableHead>
                    <TableHead onClick={() => handleSort('category')}>Category</TableHead>
                    <TableHead onClick={() => handleSort('owner')}>Owner</TableHead>
                    <TableHead onClick={() => handleSort('status')}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOpportunities.map((opportunity) => (
                    <TableRow key={opportunity._id || opportunity.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{opportunity.name}</TableCell>
                      <TableCell>{opportunity.account}</TableCell>
                      <TableCell>{opportunity.opportunity_group}</TableCell>
                      <TableCell>{opportunity.opportuni_type}</TableCell>
                      <TableCell>{opportunity.industry}</TableCell>
                      <TableCell>{opportunity.sub_industry}</TableCell>
                      <TableCell>{opportunity.contact}</TableCell>
                      <TableCell>{opportunity.source}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(opportunity.amount)}</TableCell>
                      <TableCell>{opportunity.start_date ? new Date(opportunity.start_date).toLocaleDateString() : ""}</TableCell>
                      <TableCell>{opportunity.close_date ? new Date(opportunity.close_date).toLocaleDateString() : ""}</TableCell>
                      <TableCell>{getPhaseBadge(opportunity.phase)}</TableCell>
                      <TableCell>{opportunity.probability}%</TableCell>
                      <TableCell>{getForecastBadge(opportunity.forecaset_category)}</TableCell>
                      <TableCell>{opportunity.category}</TableCell>
                      <TableCell>{opportunity.owner}</TableCell>
                      <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input id="account" name="account" value={formData.account} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity_group">Opportunity Group</Label>
                <Input id="opportunity_group" name="opportunity_group" value={formData.opportunity_group} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportuni_type">Opportunity Type</Label>
                <Input id="opportuni_type" name="opportuni_type" value={formData.opportuni_type} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" value={formData.industry} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub_industry">Sub Industry</Label>
                <Input id="sub_industry" name="sub_industry" value={formData.sub_industry} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" name="contact" value={formData.contact} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" value={formData.source} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close_date">Close Date</Label>
                <Input id="close_date" name="close_date" type="date" value={formData.close_date} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phase">Phase</Label>
                <Input id="phase" name="phase" value={formData.phase} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input id="probability" name="probability" type="number" min="0" max="100" value={formData.probability} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecaset_category">Forecast Category</Label>
                <Input id="forecaset_category" name="forecaset_category" value={formData.forecaset_category} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input id="status" name="status" value={formData.status} onChange={handleInputChange} />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Opportunity
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Opportunities;