import React, { useState } from "react";
import { CRMToolbar } from "@/components/layout/CRMToolbar";
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

// Sample data for sales quotes
const sampleQuotes = [
  {
    id: 1,
    documentType: "Sales Quote",
    account: "TechStart Inc",
    primaryContact: "Alex Johnson",
    externalReference: "REF-2024-001",
    description: "Enterprise Software Solution - 500+ users",
    date: "2024-01-15",
    paymentTerms: "Net 30",
    incoterms: "FOB",
    chanceOfSuccess: "High",
    validTo: "2024-02-15",
    owner: "John Smith",
    salesUnit: "Enterprise Sales",
    territory: "North America",
    status: "Draft",
    amount: 125000
  },
  {
    id: 2,
    documentType: "Sales Order Request",
    account: "Legacy Systems Corp",
    primaryContact: "Maria Garcia",
    externalReference: "REF-2024-002",
    description: "Cloud Migration Project - Infrastructure",
    date: "2024-01-20",
    paymentTerms: "Net 45",
    incoterms: "CIF",
    chanceOfSuccess: "Medium",
    validTo: "2024-02-20",
    owner: "Sarah Johnson",
    salesUnit: "Cloud Services",
    territory: "South America",
    status: "Sent",
    amount: 85000
  },
  {
    id: 3,
    documentType: "Sales Quote",
    account: "Traditional Business Ltd",
    primaryContact: "Robert Chen",
    externalReference: "REF-2024-003",
    description: "Digital Transformation Initiative",
    date: "2024-01-25",
    paymentTerms: "Net 60",
    incoterms: "EXW",
    chanceOfSuccess: "High",
    validTo: "2024-02-25",
    owner: "Mike Wilson",
    salesUnit: "Digital Solutions",
    territory: "Asia Pacific",
    status: "Approved",
    amount: 200000
  },
  {
    id: 4,
    documentType: "Sales Quote",
    account: "Growing Startup",
    primaryContact: "Lisa Thompson",
    externalReference: "REF-2024-004",
    description: "CRM Implementation - Small Business",
    date: "2024-01-30",
    paymentTerms: "Net 15",
    incoterms: "FCA",
    chanceOfSuccess: "Low",
    validTo: "2024-02-28",
    owner: "Emily Davis",
    salesUnit: "SMB Sales",
    territory: "Europe",
    status: "Draft",
    amount: 25000
  },
  {
    id: 5,
    documentType: "Sales Order Request",
    account: "Analytics Pro",
    primaryContact: "James Wilson",
    externalReference: "REF-2024-005",
    description: "Data Analytics Platform - Enterprise",
    date: "2024-02-01",
    paymentTerms: "Net 30",
    incoterms: "DDP",
    chanceOfSuccess: "Medium",
    validTo: "2024-03-01",
    owner: "David Brown",
    salesUnit: "Analytics Team",
    territory: "North America",
    status: "Under Review",
    amount: 150000
  }
];

const SalesQuotes = () => {
  const [showForm, setShowForm] = useState(false);
  const [quotes, setQuotes] = useState(sampleQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowForm(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredQuotes = quotes.filter(quote => 
    Object.values(quote).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
    const variant = chance === "High" ? "destructive" : chance === "Medium" ? "default" : "outline";
    return <Badge variant={variant}>{chance}</Badge>;
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
        <CRMToolbar title="Sales Quotes - New Quote" onAction={handleToolbarAction} />
        <div className="p-6">
          <FormCard title="Sales Quote Information">
            <FormSection title="Quote Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales-order-request">Sales Order Request</SelectItem>
                      <SelectItem value="sales-quote">Sales Quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" placeholder="Enter customer account" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input id="primaryContact" placeholder="Enter primary contact name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalReference">External Reference</Label>
                  <Input id="externalReference" placeholder="Enter external reference" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter quote details or product/service descriptions" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Input id="date" type="date" />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Financial & Commercial Terms">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-15">Net 15</SelectItem>
                      <SelectItem value="net-30">Net 30</SelectItem>
                      <SelectItem value="net-45">Net 45</SelectItem>
                      <SelectItem value="net-60">Net 60</SelectItem>
                      <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incoterms">Incoterms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incoterms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exw">EXW - Ex Works</SelectItem>
                      <SelectItem value="fca">FCA - Free Carrier</SelectItem>
                      <SelectItem value="fob">FOB - Free on Board</SelectItem>
                      <SelectItem value="cif">CIF - Cost, Insurance and Freight</SelectItem>
                      <SelectItem value="ddp">DDP - Delivered Duty Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chanceOfSuccess">Chance of Success</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chance of success" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (0-25%)</SelectItem>
                      <SelectItem value="medium">Medium (26-75%)</SelectItem>
                      <SelectItem value="high">High (76-100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To</Label>
                  <div className="relative">
                    <Input id="validTo" type="date" />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Responsibility & Assignment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" placeholder="Enter responsible user" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesUnit">Sales Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise-sales">Enterprise Sales</SelectItem>
                      <SelectItem value="smb-sales">SMB Sales</SelectItem>
                      <SelectItem value="cloud-services">Cloud Services</SelectItem>
                      <SelectItem value="digital-solutions">Digital Solutions</SelectItem>
                      <SelectItem value="analytics-team">Analytics Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="territory">Territory</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select territory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north-america">North America</SelectItem>
                      <SelectItem value="south-america">South America</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                      <SelectItem value="middle-east-africa">Middle East & Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Save Quote
              </Button>
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CRMToolbar title="Sales Quotes" onAction={handleToolbarAction} />
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Quotes ({sortedQuotes.length})</CardTitle>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('documentType')}>
                      Document Type
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('account')}>
                      Account
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('primaryContact')}>
                      Primary Contact
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('externalReference')}>
                      External Ref
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                      Description
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                      Date
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('paymentTerms')}>
                      Payment Terms
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('incoterms')}>
                      Incoterms
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('chanceOfSuccess')}>
                      Chance of Success
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('validTo')}>
                      Valid To
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('owner')}>
                      Owner
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('salesUnit')}>
                      Sales Unit
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('territory')}>
                      Territory
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      Status
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuotes.map((quote) => (
                    <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{quote.documentType}</TableCell>
                      <TableCell>{quote.account}</TableCell>
                      <TableCell>{quote.primaryContact}</TableCell>
                      <TableCell>{quote.externalReference}</TableCell>
                      <TableCell className="max-w-xs truncate">{quote.description}</TableCell>
                      <TableCell>{quote.date}</TableCell>
                      <TableCell>{quote.paymentTerms}</TableCell>
                      <TableCell>{quote.incoterms}</TableCell>
                      <TableCell>{getChanceBadge(quote.chanceOfSuccess)}</TableCell>
                      <TableCell>{quote.validTo}</TableCell>
                      <TableCell>{quote.owner}</TableCell>
                      <TableCell>{quote.salesUnit}</TableCell>
                      <TableCell>{quote.territory}</TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(quote.amount)}</TableCell>
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
