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
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";

// Sample data for sales orders
const sampleOrders = [
  {
    id: 1,
    documentType: "Sales Order",
    account: "TechStart Inc",
    shipTo: "123 Tech Street, San Francisco, CA 94105, USA",
    externalReference: "SO-2024-001",
    description: "Enterprise Software License - 500+ users",
    pricingDate: "2024-01-15",
    requestedDate: "2024-02-15",
    owner: "John Smith",
    salesUnit: "Enterprise Sales",
    salesOrganization: "North America Sales",
    distributionChannel: "Direct Sales",
    territory: "North America",
    status: "Confirmed",
    amount: 125000
  },
  {
    id: 2,
    documentType: "Sales Order",
    account: "Legacy Systems Corp",
    shipTo: "456 Legacy Ave, Austin, TX 78701, USA",
    externalReference: "SO-2024-002",
    description: "Cloud Infrastructure Services - 12 months",
    pricingDate: "2024-01-20",
    requestedDate: "2024-02-20",
    owner: "Sarah Johnson",
    salesUnit: "Cloud Services",
    salesOrganization: "South America Sales",
    distributionChannel: "Partner Channel",
    territory: "South America",
    status: "Processing",
    amount: 85000
  },
  {
    id: 3,
    documentType: "Sales Order",
    account: "Traditional Business Ltd",
    shipTo: "789 Business Blvd, Seattle, WA 98101, USA",
    externalReference: "SO-2024-003",
    description: "Digital Transformation Package - Complete Solution",
    pricingDate: "2024-01-25",
    requestedDate: "2024-02-25",
    owner: "Mike Wilson",
    salesUnit: "Digital Solutions",
    salesOrganization: "Asia Pacific Sales",
    distributionChannel: "Direct Sales",
    territory: "Asia Pacific",
    status: "Shipped",
    amount: 200000
  },
  {
    id: 4,
    documentType: "Sales Order",
    account: "Growing Startup",
    shipTo: "321 Startup Lane, Denver, CO 80202, USA",
    externalReference: "SO-2024-004",
    description: "CRM Implementation - Small Business Package",
    pricingDate: "2024-01-30",
    requestedDate: "2024-02-28",
    owner: "Emily Davis",
    salesUnit: "SMB Sales",
    salesOrganization: "Europe Sales",
    distributionChannel: "Online Channel",
    territory: "Europe",
    status: "Draft",
    amount: 25000
  },
  {
    id: 5,
    documentType: "Sales Order",
    account: "Analytics Pro",
    shipTo: "654 Analytics Way, Miami, FL 33101, USA",
    externalReference: "SO-2024-005",
    description: "Data Analytics Platform - Enterprise Edition",
    pricingDate: "2024-02-01",
    requestedDate: "2024-03-01",
    owner: "David Brown",
    salesUnit: "Analytics Team",
    salesOrganization: "North America Sales",
    distributionChannel: "Direct Sales",
    territory: "North America",
    status: "Delivered",
    amount: 150000
  }
];

const SalesOrders = () => {
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState(sampleOrders);
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

  const filteredOrders = orders.filter(order => 
    Object.values(order).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
      "Draft": "outline",
      "Confirmed": "secondary",
      "Processing": "default",
      "Shipped": "destructive",
      "Delivered": "destructive"
    };
    return <Badge variant={statusColors[status] || "outline"}>{status}</Badge>;
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
        <CRMToolbar title="Sales Orders - New Order" onAction={handleToolbarAction} />
        <div className="p-6">
          <FormCard title="Sales Order Information">
            <FormSection title="Order Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales-order">Sales Order</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" placeholder="Enter customer account" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipTo">Ship-To Address</Label>
                  <div className="relative">
                    <Textarea 
                      id="shipTo" 
                      placeholder="Enter shipping address details for delivery" 
                      rows={3}
                    />
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalReference">External Reference</Label>
                  <Input id="externalReference" placeholder="Enter external reference" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter order description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingDate">Pricing Date</Label>
                  <div className="relative">
                    <Input id="pricingDate" type="date" />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Requested Date</Label>
                  <div className="relative">
                    <Input id="requestedDate" type="date" />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Responsibility and Assignment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" placeholder="Enter responsible individual or team" />
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
                <div className="space-y-2">
                  <Label htmlFor="salesOrganization">Sales Organization</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north-america-sales">North America Sales</SelectItem>
                      <SelectItem value="south-america-sales">South America Sales</SelectItem>
                      <SelectItem value="europe-sales">Europe Sales</SelectItem>
                      <SelectItem value="asia-pacific-sales">Asia Pacific Sales</SelectItem>
                      <SelectItem value="middle-east-africa-sales">Middle East & Africa Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distributionChannel">Distribution Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select distribution channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct-sales">Direct Sales</SelectItem>
                      <SelectItem value="partner-channel">Partner Channel</SelectItem>
                      <SelectItem value="online-channel">Online Channel</SelectItem>
                      <SelectItem value="retail-channel">Retail Channel</SelectItem>
                      <SelectItem value="reseller-channel">Reseller Channel</SelectItem>
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
                Save Order
              </Button>
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CRMToolbar title="Sales Orders" onAction={handleToolbarAction} />
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Orders ({sortedOrders.length})</CardTitle>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('documentType')}>
                      Document Type
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('account')}>
                      Account
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('shipTo')}>
                      Ship-To
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('externalReference')}>
                      External Ref
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                      Description
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('pricingDate')}>
                      Pricing Date
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('requestedDate')}>
                      Requested Date
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('owner')}>
                      Owner
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('salesUnit')}>
                      Sales Unit
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('salesOrganization')}>
                      Sales Organization
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('distributionChannel')}>
                      Distribution Channel
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
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{order.documentType}</TableCell>
                      <TableCell>{order.account}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.shipTo}</TableCell>
                      <TableCell>{order.externalReference}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                      <TableCell>{order.pricingDate}</TableCell>
                      <TableCell>{order.requestedDate}</TableCell>
                      <TableCell>{order.owner}</TableCell>
                      <TableCell>{order.salesUnit}</TableCell>
                      <TableCell>{order.salesOrganization}</TableCell>
                      <TableCell>{order.distributionChannel}</TableCell>
                      <TableCell>{order.territory}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedOrders.length)} of {sortedOrders.length} entries
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

export default SalesOrders;
