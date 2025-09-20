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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";

// Sample data for opportunities with all specified fields
const sampleOpportunities = [
  {
    id: 1,
    name: "Enterprise Software Deal",
    account: "Fortune 500 Corp",
    opportunityGroup: "Enterprise",
    opportunityType: "New Business",
    industry: "Technology",
    subIndustry: "Software",
    primaryContact: "Jennifer Martinez",
    source: "Referral",
    expectedValue: 500000,
    startDate: "2024-01-15",
    closeDate: "2024-03-15",
    salesPhase: "Proposal",
    probability: 75,
    forecastCategory: "Pipeline",
    category: "Enterprise Software",
    owner: "John Smith",
    note: "Large enterprise deal worth $500K+ annually",
    status: "Active"
  },
  {
    id: 2,
    name: "Cloud Infrastructure Upgrade",
    account: "Mid-Size Manufacturing",
    opportunityGroup: "Mid-Market",
    opportunityType: "Expansion",
    industry: "Manufacturing",
    subIndustry: "Industrial",
    primaryContact: "Carlos Rodriguez",
    source: "Website",
    expectedValue: 150000,
    startDate: "2024-01-20",
    closeDate: "2024-04-20",
    salesPhase: "Negotiation",
    probability: 60,
    forecastCategory: "Best Case",
    category: "Cloud Services",
    owner: "Sarah Johnson",
    note: "Multi-year cloud infrastructure deal with expansion potential",
    status: "Active"
  },
  {
    id: 3,
    name: "Digital Transformation Package",
    account: "Regional Bank",
    opportunityGroup: "Enterprise",
    opportunityType: "New Business",
    industry: "Financial Services",
    subIndustry: "Banking",
    primaryContact: "Amanda Foster",
    source: "Trade Show",
    expectedValue: 300000,
    startDate: "2024-01-25",
    closeDate: "2024-05-25",
    salesPhase: "Qualified",
    probability: 80,
    forecastCategory: "Commit",
    category: "Digital Transformation",
    owner: "Mike Wilson",
    note: "Complete digital transformation for banking operations",
    status: "Active"
  },
  {
    id: 4,
    name: "Analytics Platform Implementation",
    account: "Healthcare Network",
    opportunityGroup: "Healthcare",
    opportunityType: "New Business",
    industry: "Healthcare",
    subIndustry: "Hospital Systems",
    primaryContact: "Dr. Michael Chang",
    source: "LinkedIn",
    expectedValue: 200000,
    startDate: "2024-01-30",
    closeDate: "2024-06-30",
    salesPhase: "Discovery",
    probability: 45,
    forecastCategory: "Pipeline",
    category: "Healthcare Analytics",
    owner: "Emily Davis",
    note: "Advanced analytics for patient care optimization",
    status: "Active"
  },
  {
    id: 5,
    name: "Security Solutions Upgrade",
    account: "Tech Startup Hub",
    opportunityGroup: "Startup",
    opportunityType: "Expansion",
    industry: "Technology",
    subIndustry: "Cybersecurity",
    primaryContact: "Rachel Kim",
    source: "Partner Referral",
    expectedValue: 75000,
    startDate: "2024-02-01",
    closeDate: "2024-04-01",
    salesPhase: "Proposal",
    probability: 70,
    forecastCategory: "Best Case",
    category: "Cybersecurity",
    owner: "David Brown",
    note: "Comprehensive security solution for growing startup ecosystem",
    status: "Active"
  }
];

const Opportunities = () => {
  const [showModal, setShowModal] = useState(false);
  const [opportunities, setOpportunities] = useState(sampleOpportunities);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleToolbarAction = (action) => {
    if (action === 'add-new') {
      setShowModal(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add new opportunity logic here
    setShowModal(false);
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
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  const getSalesPhaseBadge = (phase) => {
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      Name
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('account')}>
                      Account
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('opportunityGroup')}>
                      Opportunity Group
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('opportunityType')}>
                      Opportunity Type
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('industry')}>
                      Industry
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('subIndustry')}>
                      Sub Industry
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('primaryContact')}>
                      Primary Contact
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('source')}>
                      Source
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('expectedValue')}>
                      Expected Value
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('startDate')}>
                      Start Date
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('closeDate')}>
                      Close Date
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('salesPhase')}>
                      Sales Phase
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('probability')}>
                      Probability
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('forecastCategory')}>
                      Forecast Category
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                      Category
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('owner')}>
                      Owner
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOpportunities.map((opportunity) => (
                    <TableRow key={opportunity.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{opportunity.name}</TableCell>
                      <TableCell>{opportunity.account}</TableCell>
                      <TableCell>{opportunity.opportunityGroup}</TableCell>
                      <TableCell>{opportunity.opportunityType}</TableCell>
                      <TableCell>{opportunity.industry}</TableCell>
                      <TableCell>{opportunity.subIndustry}</TableCell>
                      <TableCell>{opportunity.primaryContact}</TableCell>
                      <TableCell>{opportunity.source}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(opportunity.expectedValue)}</TableCell>
                      <TableCell>{opportunity.startDate}</TableCell>
                      <TableCell>{opportunity.closeDate}</TableCell>
                      <TableCell>{getSalesPhaseBadge(opportunity.salesPhase)}</TableCell>
                      <TableCell>{opportunity.probability}%</TableCell>
                      <TableCell>{getForecastBadge(opportunity.forecastCategory)}</TableCell>
                      <TableCell>{opportunity.category}</TableCell>
                      <TableCell>{opportunity.owner}</TableCell>
                      <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
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

      {/* Modal Form */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter opportunity name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input id="account" placeholder="Enter account name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunityGroup">Opportunity Group</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="mid-market">Mid-Market</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunityType">Opportunity Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-business">New Business</SelectItem>
                    <SelectItem value="expansion">Expansion</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                    <SelectItem value="upsell">Upsell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="financial-services">Financial Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Sub Industry</Label>
                <Input id="subIndustry" placeholder="Enter sub industry" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContact">Primary Contact</Label>
                <Input id="primaryContact" placeholder="Enter primary contact name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="trade-show">Trade Show</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="cold-call">Cold Call</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedValue">Expected Value</Label>
                <Input id="expectedValue" type="number" placeholder="Enter expected value" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Input id="startDate" type="date" />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeDate">Close Date</Label>
                <div className="relative">
                  <Input id="closeDate" type="date" />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesPhase">Sales Phase</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed-won">Closed Won</SelectItem>
                    <SelectItem value="closed-lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input id="probability" type="number" min="0" max="100" placeholder="Enter probability" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecastCategory">Forecast Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select forecast category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pipeline">Pipeline</SelectItem>
                    <SelectItem value="best-case">Best Case</SelectItem>
                    <SelectItem value="commit">Commit</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Enter category" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input id="owner" placeholder="Enter owner name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" placeholder="Enter notes" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
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