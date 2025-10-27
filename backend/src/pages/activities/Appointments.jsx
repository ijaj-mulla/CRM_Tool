import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FormCard } from "@/components/forms/FormCard";
import { FormSection } from "@/components/forms/FormSection";

const DEFAULTS = {
  subject: "",
  account: "",
  sales_organization: "",
  primary_contact: "",
  location: "",
  all_day: false,
  show_as: "Free",
  start: "",
  end: "",
  category: "Other Reason",
  priority: "3 - Normal",
  status: "Open",
  campaign: "",
  owner: "Malik Akhtar",
  territory: "",
  notes: "",
  attendees: [{ name: "", email: "" }],
};

const allColumns = [
  { key: "subject", label: "Subject" },
  { key: "account", label: "Account" },
  { key: "sales_organization", label: "Sales Organization" },
  { key: "primary_contact", label: "Primary Contact" },
  { key: "start", label: "Start" },
  { key: "end", label: "End" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
  { key: "territory", label: "Sales Territory" },
];

const storageKey = "appointments.visibleColumns";

const Appointments = () => {
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ ...DEFAULTS });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init = {}; allColumns.forEach(c => init[c.key] = true); return init;
  });
  const isVisible = (k) => visibleColumns[k] !== false;

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchAppointments();
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

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/appointments");
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err.response?.data || err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttendeeChange = (index, field, value) => {
    setFormData((prev) => {
      const next = prev.attendees.map((a, i) => i === index ? { ...a, [field]: value } : a);
      return { ...prev, attendees: next };
    });
  };

  const addAttendee = () => {
    setFormData((prev) => ({ ...prev, attendees: [...prev.attendees, { name: "", email: "" }] }));
  };

  const removeAttendee = (index) => {
    setFormData((prev) => ({ ...prev, attendees: prev.attendees.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start: formData.start || undefined,
        end: formData.end || undefined,
      };

      if (!payload.subject) { alert("Subject is required"); return; }
      if (!payload.owner) { alert("Owner is required"); return; }

      await axios.post("http://localhost:5000/api/appointments", payload);
      setShowForm(false);
      setFormData({ ...DEFAULTS });
      fetchAppointments();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      alert("Failed to create appointment: " + msg);
    }
  };

  const filtered = useMemo(() => (
    appointments.filter((a) =>
      Object.values(a).some((v) => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ), [appointments, searchTerm]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a?.[sortField] ?? "";
      const bv = b?.[sortField] ?? "";
      return av > bv ? direction : -direction;
    });
  }, [filtered, sortField, sortDirection]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Appointment Information">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Top Fields">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" name="account" value={formData.account} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sales_organization">Sales Organization</Label>
                  <Input id="sales_organization" name="sales_organization" value={formData.sales_organization} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_contact">Primary Contact</Label>
                  <Input id="primary_contact" name="primary_contact" value={formData.primary_contact} onChange={handleInputChange} />
                </div>
              </FormSection>

              <FormSection title="Event Details">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <Checkbox id="all_day" checked={formData.all_day} onCheckedChange={(v) => setFormData((p) => ({ ...p, all_day: !!v }))} />
                  <Label htmlFor="all_day">All-Day Event</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="show_as">Show As</Label>
                  <ShadSelect value={formData.show_as} onValueChange={(v) => handleSelectChange("show_as", v)}>
                    <ShadSelectTrigger>
                      <ShadSelectValue placeholder="Select" />
                    </ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Free">Free</ShadSelectItem>
                      <ShadSelectItem value="Busy">Busy</ShadSelectItem>
                      <ShadSelectItem value="Tentative">Tentative</ShadSelectItem>
                      <ShadSelectItem value="Out of Office">Out of Office</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">Start Date/Time</Label>
                  <Input id="start" name="start" type="datetime-local" value={formData.start} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Date/Time</Label>
                  <Input id="end" name="end" type="datetime-local" value={formData.end} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <ShadSelect value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Other Reason">Other Reason</ShadSelectItem>
                      <ShadSelectItem value="Customer Meeting">Customer Meeting</ShadSelectItem>
                      <ShadSelectItem value="Internal">Internal</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <ShadSelect value={formData.priority} onValueChange={(v) => handleSelectChange("priority", v)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="1 - High">1 - High</ShadSelectItem>
                      <ShadSelectItem value="2 - Medium">2 - Medium</ShadSelectItem>
                      <ShadSelectItem value="3 - Normal">3 - Normal</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <ShadSelect value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Open">Open</ShadSelectItem>
                      <ShadSelectItem value="In Progress">In Progress</ShadSelectItem>
                      <ShadSelectItem value="Closed">Closed</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
              </FormSection>

              <FormSection title="Additional Fields">
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign</Label>
                  <Input id="campaign" name="campaign" value={formData.campaign} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territory">Sales Territory</Label>
                  <Input id="territory" name="territory" value={formData.territory} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleInputChange} />
                </div>
              </FormSection>

              <FormSection title="Attendees">
                <div className="lg:col-span-2 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.attendees.map((a, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="w-[30%]">
                            <Input value={a.name} onChange={(e) => handleAttendeeChange(idx, 'name', e.target.value)} placeholder="Name" />
                          </TableCell>
                          <TableCell className="w-[40%]">
                            <Input type="email" value={a.email} onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)} placeholder="email@example.com" />
                          </TableCell>
                          <TableCell className="w-[30%]">
                            <Button type="button" variant="outline" onClick={() => removeAttendee(idx)}>Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Button type="button" variant="secondary" onClick={addAttendee}>+ Add attendee</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </FormSection>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Appointment</Button>
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
              <CardTitle>My Appointments ({sorted.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search appointments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {isVisible('subject') && <TableHead onClick={() => setSortField('subject')}>Subject</TableHead>}
                    {isVisible('account') && <TableHead onClick={() => setSortField('account')}>Account</TableHead>}
                    {isVisible('sales_organization') && <TableHead onClick={() => setSortField('sales_organization')}>Sales Organization</TableHead>}
                    {isVisible('primary_contact') && <TableHead onClick={() => setSortField('primary_contact')}>Primary Contact</TableHead>}
                    {isVisible('start') && <TableHead onClick={() => setSortField('start')}>Start</TableHead>}
                    {isVisible('end') && <TableHead onClick={() => setSortField('end')}>End</TableHead>}
                    {isVisible('category') && <TableHead onClick={() => setSortField('category')}>Category</TableHead>}
                    {isVisible('priority') && <TableHead onClick={() => setSortField('priority')}>Priority</TableHead>}
                    {isVisible('status') && <TableHead onClick={() => setSortField('status')}>Status</TableHead>}
                    {isVisible('owner') && <TableHead onClick={() => setSortField('owner')}>Owner</TableHead>}
                    {isVisible('territory') && <TableHead onClick={() => setSortField('territory')}>Sales Territory</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((a) => (
                    <TableRow key={a._id || a.id} className="cursor-pointer hover:bg-muted/50">
                      {isVisible('subject') && <TableCell className="font-medium">{a.subject}</TableCell>}
                      {isVisible('account') && <TableCell>{a.account}</TableCell>}
                      {isVisible('sales_organization') && <TableCell>{a.sales_organization}</TableCell>}
                      {isVisible('primary_contact') && <TableCell>{a.primary_contact}</TableCell>}
                      {isVisible('start') && <TableCell>{a.start ? new Date(a.start).toLocaleString() : ""}</TableCell>}
                      {isVisible('end') && <TableCell>{a.end ? new Date(a.end).toLocaleString() : ""}</TableCell>}
                      {isVisible('category') && <TableCell>{a.category}</TableCell>}
                      {isVisible('priority') && <TableCell>{a.priority}</TableCell>}
                      {isVisible('status') && <TableCell>{a.status}</TableCell>}
                      {isVisible('owner') && <TableCell>{a.owner}</TableCell>}
                      {isVisible('territory') && <TableCell>{a.territory}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sorted.length)} of {sorted.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
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
          <DialogHeader><DialogTitle>Sort Appointments</DialogTitle></DialogHeader>
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

export default Appointments;


