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
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Accounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountId: "",
    accountType: "",
    accountName: "",
    prospectRole: "",
    website: "",
    status: "",
    salesOrganization: "",
    buAssignment: "",
    industryHorizontal: "",
    vertical: "",
    subVertical: "",
    country: "",
    postalCode: "",
    city: "",
    state: "",
    district: "",
    street: "",
    territory: "",
    owner: "",
    taxCountry: "",
    taxNumberType: "",
    taxNumber: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch accounts from backend
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleToolbarAction = (action) => {
    if (action === "add-new") setShowForm(true);
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
      await axios.post("http://localhost:5000/api/accounts", formData);
      setShowForm(false);
      setFormData({
        accountId: "",
        accountType: "",
        accountName: "",
        prospectRole: "",
        website: "",
        status: "",
        salesOrganization: "",
        buAssignment: "",
        industryHorizontal: "",
        vertical: "",
        subVertical: "",
        country: "",
        postalCode: "",
        city: "",
        state: "",
        district: "",
        street: "",
        territory: "",
        owner: "",
        taxCountry: "",
        taxNumberType: "",
        taxNumber: ""
      });
      fetchAccounts(); // Refresh the table
    } catch (error) {
      console.error("Error creating account:", error);
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

  const filteredAccounts = accounts.filter(account =>
    Object.values(account).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const variant = status === "Active" ? "default" : status === "Prospect" ? "secondary" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  // ...existing code...
if (showForm) {
  return (
    <div className="min-h-screen bg-background">
      <CRMToolbar title="Accounts - New Account" onAction={handleToolbarAction} />
      <div className="p-6">
        <FormCard title="Account Information">
          <form onSubmit={handleSubmit}>
            <FormSection title="Account Information">
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input id="accountId" name="accountId" value={formData.accountId} onChange={handleInputChange} placeholder="Enter account ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={formData.accountType} onValueChange={(val) => handleSelectChange("accountType", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" name="accountName" value={formData.accountName} onChange={handleInputChange} placeholder="Enter account name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectRole">Prospect Role</Label>
                <Select value={formData.prospectRole} onValueChange={(val) => handleSelectChange("prospectRole", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select prospect role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                    <SelectItem value="Influencer">Influencer</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="Enter website URL" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormSection>
            <FormSection title="Sales & Business Details">
              <div className="space-y-2">
                <Label htmlFor="salesOrganization">Sales Organization</Label>
                <Input id="salesOrganization" name="salesOrganization" value={formData.salesOrganization} onChange={handleInputChange} placeholder="Enter sales organization" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buAssignment">BU Assignment</Label>
                <Input id="buAssignment" name="buAssignment" value={formData.buAssignment} onChange={handleInputChange} placeholder="Enter BU assignment" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industryHorizontal">Industry Categories (Horizontal)</Label>
                <Select value={formData.industryHorizontal} onValueChange={(val) => handleSelectChange("industryHorizontal", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select horizontal category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vertical">Vertical</Label>
                <Select value={formData.vertical} onValueChange={(val) => handleSelectChange("vertical", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vertical category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subVertical">Sub Vertical</Label>
                <Select value={formData.subVertical} onValueChange={(val) => handleSelectChange("subVertical", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise Software">Enterprise Software</SelectItem>
                    <SelectItem value="SMB">SMB</SelectItem>
                    <SelectItem value="Startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormSection>
            <FormSection title="Location Details">
              <div className="space-y-2">
                <Label htmlFor="country">Country/Region</Label>
                <Select value={formData.country} onValueChange={(val) => handleSelectChange("country", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country/region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="Enter postal code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" name="district" value={formData.district} onChange={handleInputChange} placeholder="Enter district" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" name="street" value={formData.street} onChange={handleInputChange} placeholder="Enter street address" />
              </div>
            </FormSection>
            <FormSection title="Territory Management">
              <div className="space-y-2">
                <Label htmlFor="territory">Territory</Label>
                <Input id="territory" name="territory" value={formData.territory} onChange={handleInputChange} placeholder="Enter territory" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} placeholder="Enter owner" />
              </div>
            </FormSection>
            <FormSection title="Tax Information">
              <div className="space-y-2">
                <Label htmlFor="taxCountry">Tax Country/Region</Label>
                <Select value={formData.taxCountry} onValueChange={(val) => handleSelectChange("taxCountry", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax country/region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumberType">Tax Number Type</Label>
                <Select value={formData.taxNumberType} onValueChange={(val) => handleSelectChange("taxNumberType", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax number type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EIN">EIN</SelectItem>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="GSTIN">GSTIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Number</Label>
                <Input id="taxNumber" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} placeholder="Enter tax number" />
              </div>
            </FormSection>
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Save Account</Button>
            </div>
          </form>
        </FormCard>
      </div>
    </div>
  );
}
// ...existing code...

  return (
    <div className="min-h-screen bg-background">
      <CRMToolbar title="Accounts" onAction={handleToolbarAction} />
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Accounts ({sortedAccounts.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead onClick={() => handleSort("accountId")}>Account ID</TableHead>
                    <TableHead onClick={() => handleSort("accountType")}>Type</TableHead>
                    <TableHead onClick={() => handleSort("accountName")}>Account Name</TableHead>
                    <TableHead onClick={() => handleSort("prospectRole")}>Prospect Role</TableHead>
                    <TableHead onClick={() => handleSort("website")}>Website</TableHead>
                    <TableHead onClick={() => handleSort("status")}>Status</TableHead>
                    <TableHead onClick={() => handleSort("salesOrganization")}>Sales Org</TableHead>
                    <TableHead onClick={() => handleSort("buAssignment")}>BU Assignment</TableHead>
                    <TableHead onClick={() => handleSort("industryHorizontal")}>Industry Horizontal</TableHead>
                    <TableHead onClick={() => handleSort("vertical")}>Vertical</TableHead>
                    <TableHead onClick={() => handleSort("subVertical")}>Sub Vertical</TableHead>
                    <TableHead onClick={() => handleSort("country")}>Country</TableHead>
                    <TableHead onClick={() => handleSort("postalCode")}>Postal Code</TableHead>
                    <TableHead onClick={() => handleSort("city")}>City</TableHead>
                    <TableHead onClick={() => handleSort("state")}>State</TableHead>
                    <TableHead onClick={() => handleSort("district")}>District</TableHead>
                    <TableHead onClick={() => handleSort("street")}>Street</TableHead>
                    <TableHead onClick={() => handleSort("territory")}>Territory</TableHead>
                    <TableHead onClick={() => handleSort("owner")}>Owner</TableHead>
                    <TableHead onClick={() => handleSort("taxCountry")}>Tax Country</TableHead>
                    <TableHead onClick={() => handleSort("taxNumberType")}>Tax Number Type</TableHead>
                    <TableHead onClick={() => handleSort("taxNumber")}>Tax Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.map((account) => (
                    <TableRow key={account._id} className="cursor-pointer hover:bg-muted/50">
                       <TableCell>{account.accountId}</TableCell>
                        <TableCell>{account.accountType}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>{account.prospectRole}</TableCell>
                        <TableCell>{account.website}</TableCell>
                        <TableCell>{getStatusBadge(account.status)}</TableCell>
                        <TableCell>{account.salesOrganization}</TableCell>
                        <TableCell>{account.buAssignment}</TableCell>
                        <TableCell>{account.industryHorizontal}</TableCell>
                        <TableCell>{account.vertical}</TableCell>
                        <TableCell>{account.subVertical}</TableCell>
                        <TableCell>{account.country}</TableCell>
                        <TableCell>{account.postalCode}</TableCell>
                        <TableCell>{account.city}</TableCell>
                        <TableCell>{account.state}</TableCell>
                        <TableCell>{account.district}</TableCell>
                        <TableCell>{account.street}</TableCell>
                        <TableCell>{account.territory}</TableCell>
                        <TableCell>{account.owner}</TableCell>
                        <TableCell>{account.taxCountry}</TableCell>
                        <TableCell>{account.taxNumberType}</TableCell>
                        <TableCell>{account.taxNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedAccounts.length)} of {sortedAccounts.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
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

export default Accounts;
