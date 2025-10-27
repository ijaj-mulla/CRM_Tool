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
  primary_contact: "",
  processor: "Malik Akhtar",
  completion: 0,
  start_date: "",
  start_time: "",
  due_date: "",
  due_time: "",
  category: "",
  priority: "Normal",
  status: "Open",
  owner: "",
  campaign: "",
  territory: "",
  notes: "",
};

const allColumns = [
  { key: "subject", label: "Subject" },
  { key: "account", label: "Account" },
  { key: "primary_contact", label: "Primary Contact" },
  { key: "processor", label: "Processor" },
  { key: "completion", label: "Completion" },
  { key: "start", label: "Start" },
  { key: "due", label: "Due" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
  { key: "territory", label: "Sales Territory" },
];

const storageKey = "tasks.visibleColumns";

const Tasks = () => {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState([]);
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

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e?.detail?.action;
      if (a === 'refresh') fetchTasks();
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

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        completion: formData.completion !== "" && formData.completion !== null ? Number(formData.completion) : 0,
        start: formData.start_date && formData.start_time ? `${formData.start_date}T${formData.start_time}` : undefined,
        due: formData.due_date && formData.due_time ? `${formData.due_date}T${formData.due_time}` : undefined,
      };

      if (!payload.subject) { alert("Subject is required"); return; }
      if (!payload.category) { alert("Category is required"); return; }

      await axios.post("http://localhost:5000/api/tasks", payload);
      setShowForm(false);
      setFormData({ ...DEFAULTS });
      fetchTasks();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      alert("Failed to create task: " + msg);
    }
  };

  const filtered = useMemo(() => (
    tasks.filter((t) =>
      Object.values(t).some((v) => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ), [tasks, searchTerm]);

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
          <FormCard title="Task Information">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="General">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" name="account" value={formData.account} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_contact">Primary Contact</Label>
                  <Input id="primary_contact" name="primary_contact" value={formData.primary_contact} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processor">Processor</Label>
                  <Input id="processor" name="processor" value={formData.processor} onChange={handleInputChange} />
                </div>
              </FormSection>

              <FormSection title="Schedule & Progress">
                <div className="space-y-2">
                  <Label htmlFor="completion">Completion</Label>
                  <ShadSelect value={String(formData.completion)} onValueChange={(v) => handleSelectChange("completion", Number(v))}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="0%" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      {[0,10,20,30,40,50,60,70,80,90,100].map(p => (
                        <ShadSelectItem key={p} value={String(p)}>{p}%</ShadSelectItem>
                      ))}
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date/Time</Label>
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleInputChange} />
                  </div>
                  <div className="mt-6 md:mt-0">
                    <Input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date/Time</Label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleInputChange} />
                  </div>
                  <div className="mt-6 md:mt-0">
                    <Input id="due_time" name="due_time" type="time" value={formData.due_time} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <ShadSelect value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select category" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="General">General</ShadSelectItem>
                      <ShadSelectItem value="Follow Up">Follow Up</ShadSelectItem>
                      <ShadSelectItem value="Call">Call</ShadSelectItem>
                      <ShadSelectItem value="Email">Email</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <ShadSelect value={formData.priority} onValueChange={(v) => handleSelectChange("priority", v)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select priority" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="High">High</ShadSelectItem>
                      <ShadSelectItem value="Normal">Normal</ShadSelectItem>
                      <ShadSelectItem value="Low">Low</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <ShadSelect value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select status" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Open">Open</ShadSelectItem>
                      <ShadSelectItem value="In Progress">In Progress</ShadSelectItem>
                      <ShadSelectItem value="Completed">Completed</ShadSelectItem>
                      <ShadSelectItem value="Cancelled">Cancelled</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
              </FormSection>

              <FormSection title="Additional">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign</Label>
                  <Input id="campaign" name="campaign" value={formData.campaign} onChange={handleInputChange} />
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

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Task</Button>
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
              <CardTitle>My Tasks ({sorted.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-64" />
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
                    {isVisible('primary_contact') && <TableHead onClick={() => setSortField('primary_contact')}>Primary Contact</TableHead>}
                    {isVisible('processor') && <TableHead onClick={() => setSortField('processor')}>Processor</TableHead>}
                    {isVisible('completion') && <TableHead onClick={() => setSortField('completion')}>Completion</TableHead>}
                    {isVisible('start') && <TableHead onClick={() => setSortField('start')}>Start</TableHead>}
                    {isVisible('due') && <TableHead onClick={() => setSortField('due')}>Due</TableHead>}
                    {isVisible('category') && <TableHead onClick={() => setSortField('category')}>Category</TableHead>}
                    {isVisible('priority') && <TableHead onClick={() => setSortField('priority')}>Priority</TableHead>}
                    {isVisible('status') && <TableHead onClick={() => setSortField('status')}>Status</TableHead>}
                    {isVisible('owner') && <TableHead onClick={() => setSortField('owner')}>Owner</TableHead>}
                    {isVisible('territory') && <TableHead onClick={() => setSortField('territory')}>Sales Territory</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((t) => (
                    <TableRow key={t._id || t.id} className="cursor-pointer hover:bg-muted/50">
                      {isVisible('subject') && <TableCell className="font-medium">{t.subject}</TableCell>}
                      {isVisible('account') && <TableCell>{t.account}</TableCell>}
                      {isVisible('primary_contact') && <TableCell>{t.primary_contact}</TableCell>}
                      {isVisible('processor') && <TableCell>{t.processor}</TableCell>}
                      {isVisible('completion') && <TableCell>{typeof t.completion === 'number' ? `${t.completion}%` : t.completion}</TableCell>}
                      {isVisible('start') && <TableCell>{t.start ? new Date(t.start).toLocaleString() : ""}</TableCell>}
                      {isVisible('due') && <TableCell>{t.due ? new Date(t.due).toLocaleString() : ""}</TableCell>}
                      {isVisible('category') && <TableCell>{t.category}</TableCell>}
                      {isVisible('priority') && <TableCell>{t.priority}</TableCell>}
                      {isVisible('status') && <TableCell>{t.status}</TableCell>}
                      {isVisible('owner') && <TableCell>{t.owner}</TableCell>}
                      {isVisible('territory') && <TableCell>{t.territory}</TableCell>}
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
          <DialogHeader><DialogTitle>Sort Tasks</DialogTitle></DialogHeader>
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

export default Tasks;


