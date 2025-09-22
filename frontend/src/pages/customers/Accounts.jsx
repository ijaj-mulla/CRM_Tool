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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Toolbar-driven UI state
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  // Manage columns (persist per page)
  const allColumns = [
    { key: "accountId", label: "Account ID" },
    { key: "accountType", label: "Type" },
    { key: "accountName", label: "Account Name" },
    { key: "prospectRole", label: "Prospect Role" },
    { key: "website", label: "Website" },
    { key: "status", label: "Status" },
    { key: "salesOrganization", label: "Sales Org" },
    { key: "buAssignment", label: "BU Assignment" },
    { key: "industryHorizontal", label: "Industry Horizontal" },
    { key: "vertical", label: "Vertical" },
    { key: "subVertical", label: "Sub Vertical" },
    { key: "country", label: "Country" },
    { key: "postalCode", label: "Postal Code" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "street", label: "Street" },
    { key: "territory", label: "Territory" },
    { key: "owner", label: "Owner" },
    { key: "taxCountry", label: "Tax Country" },
    { key: "taxNumberType", label: "Tax Number Type" },
    { key: "taxNumber", label: "Tax Number" },
  ];
  const storageKey = "accounts.visibleColumns";
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const initial = {};
    allColumns.forEach(c => { initial[c.key] = true; });
    return initial;
  });
  const isVisible = (key) => visibleColumns[key] !== false;

  // Fetch accounts from backend
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Listen to global toolbar actions
  useEffect(() => {
    const handler = (e) => {
      const action = e?.detail?.action;
      if (action === "refresh") {
        fetchAccounts();
      } else if (action === "add-new") {
        setShowForm(true);
      } else if (action === "sort") {
        setShowSortDialog(true);
      } else if (action === "manage-columns") {
        setShowColumnsDialog(true);
      }
    };
    window.addEventListener("crm-toolbar-action", handler);
    document.addEventListener("crm-toolbar-action", handler);
    return () => {
      window.removeEventListener("crm-toolbar-action", handler);
      document.removeEventListener("crm-toolbar-action", handler);
    };
  }, []);

  // Persist column visibility
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

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

  const applySortSelection = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setShowSortDialog(false);
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
      <div className="p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Accounts ({sortedAccounts.length})</CardTitle>
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
                    {isVisible("accountId") && <TableHead onClick={() => handleSort("accountId")}>Account ID</TableHead>}
                    {isVisible("accountType") && <TableHead onClick={() => handleSort("accountType")}>Type</TableHead>}
                    {isVisible("accountName") && <TableHead onClick={() => handleSort("accountName")}>Account Name</TableHead>}
                    {isVisible("prospectRole") && <TableHead onClick={() => handleSort("prospectRole")}>Prospect Role</TableHead>}
                    {isVisible("website") && <TableHead onClick={() => handleSort("website")}>Website</TableHead>}
                    {isVisible("status") && <TableHead onClick={() => handleSort("status")}>Status</TableHead>}
                    {isVisible("salesOrganization") && <TableHead onClick={() => handleSort("salesOrganization")}>Sales Org</TableHead>}
                    {isVisible("buAssignment") && <TableHead onClick={() => handleSort("buAssignment")}>BU Assignment</TableHead>}
                    {isVisible("industryHorizontal") && <TableHead onClick={() => handleSort("industryHorizontal")}>Industry Horizontal</TableHead>}
                    {isVisible("vertical") && <TableHead onClick={() => handleSort("vertical")}>Vertical</TableHead>}
                    {isVisible("subVertical") && <TableHead onClick={() => handleSort("subVertical")}>Sub Vertical</TableHead>}
                    {isVisible("country") && <TableHead onClick={() => handleSort("country")}>Country</TableHead>}
                    {isVisible("postalCode") && <TableHead onClick={() => handleSort("postalCode")}>Postal Code</TableHead>}
                    {isVisible("city") && <TableHead onClick={() => handleSort("city")}>City</TableHead>}
                    {isVisible("state") && <TableHead onClick={() => handleSort("state")}>State</TableHead>}
                    {isVisible("district") && <TableHead onClick={() => handleSort("district")}>District</TableHead>}
                    {isVisible("street") && <TableHead onClick={() => handleSort("street")}>Street</TableHead>}
                    {isVisible("territory") && <TableHead onClick={() => handleSort("territory")}>Territory</TableHead>}
                    {isVisible("owner") && <TableHead onClick={() => handleSort("owner")}>Owner</TableHead>}
                    {isVisible("taxCountry") && <TableHead onClick={() => handleSort("taxCountry")}>Tax Country</TableHead>}
                    {isVisible("taxNumberType") && <TableHead onClick={() => handleSort("taxNumberType")}>Tax Number Type</TableHead>}
                    {isVisible("taxNumber") && <TableHead onClick={() => handleSort("taxNumber")}>Tax Number</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.map((account) => (
                    <TableRow key={account._id} className="cursor-pointer hover:bg-muted/50">
                        {isVisible("accountId") && <TableCell>{account.accountId}</TableCell>}
                        {isVisible("accountType") && <TableCell>{account.accountType}</TableCell>}
                        {isVisible("accountName") && <TableCell>{account.accountName}</TableCell>}
                        {isVisible("prospectRole") && <TableCell>{account.prospectRole}</TableCell>}
                        {isVisible("website") && <TableCell>{account.website}</TableCell>}
                        {isVisible("status") && <TableCell>{getStatusBadge(account.status)}</TableCell>}
                        {isVisible("salesOrganization") && <TableCell>{account.salesOrganization}</TableCell>}
                        {isVisible("buAssignment") && <TableCell>{account.buAssignment}</TableCell>}
                        {isVisible("industryHorizontal") && <TableCell>{account.industryHorizontal}</TableCell>}
                        {isVisible("vertical") && <TableCell>{account.vertical}</TableCell>}
                        {isVisible("subVertical") && <TableCell>{account.subVertical}</TableCell>}
                        {isVisible("country") && <TableCell>{account.country}</TableCell>}
                        {isVisible("postalCode") && <TableCell>{account.postalCode}</TableCell>}
                        {isVisible("city") && <TableCell>{account.city}</TableCell>}
                        {isVisible("state") && <TableCell>{account.state}</TableCell>}
                        {isVisible("district") && <TableCell>{account.district}</TableCell>}
                        {isVisible("street") && <TableCell>{account.street}</TableCell>}
                        {isVisible("territory") && <TableCell>{account.territory}</TableCell>}
                        {isVisible("owner") && <TableCell>{account.owner}</TableCell>}
                        {isVisible("taxCountry") && <TableCell>{account.taxCountry}</TableCell>}
                        {isVisible("taxNumberType") && <TableCell>{account.taxNumberType}</TableCell>}
                        {isVisible("taxNumber") && <TableCell>{account.taxNumber}</TableCell>}
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

      {/* Sort Dialog */}
      <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sort</DialogTitle>
          </DialogHeader>
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
            <Button onClick={() => applySortSelection(sortField || "accountId", sortDirection || "asc")}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Columns Dialog */}
      <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Columns</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
