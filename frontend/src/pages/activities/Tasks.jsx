import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResizableTable from "@/components/table/ResizableTable";
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
  processor: "",
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
  // Typeahead state
  const [accountQuery, setAccountQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [accountsCache, setAccountsCache] = useState([]);
  const [contactsCache, setContactsCache] = useState([]);
  const [accountResults, setAccountResults] = useState([]);
  const [contactResults, setContactResults] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);
  const [showContactList, setShowContactList] = useState(false);
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

  // Load accounts/contacts when form opens for typeahead
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [accRes, conRes] = await Promise.all([
          axios.get("http://localhost:5000/api/accounts"),
          axios.get("http://localhost:5000/api/contacts"),
        ]);
        setAccountsCache(accRes.data || []);
        setContactsCache(conRes.data || []);
      } catch (e) { /* ignore */ }
    };
    if (showForm) loadRefs();
  }, [showForm]);

  // Debounced filter accounts
  useEffect(() => {
    const t = setTimeout(() => {
      if (!accountQuery || accountQuery.trim().length < 2) {
        setAccountResults([]); setShowAccountList(false); return;
      }
      const q = accountQuery.toLowerCase();
      const matches = accountsCache.filter(a =>
        (a.name || "").toLowerCase().includes(q) ||
        (a.accountId || "").toLowerCase().includes(q)
      ).slice(0, 10);
      setAccountResults(matches);
      setShowAccountList(matches.length > 0);
    }, 200);
    return () => clearTimeout(t);
  }, [accountQuery, accountsCache]);

  // Debounced filter contacts
  useEffect(() => {
    const t = setTimeout(() => {
      if (!contactQuery || contactQuery.trim().length < 2) {
        setContactResults([]); setShowContactList(false); return;
      }
      const q = contactQuery.toLowerCase();
      const matches = contactsCache.filter(c =>
        (c.mainContact || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.mobile || "").toString().toLowerCase().includes(q)
      ).slice(0, 10);
      setContactResults(matches);
      setShowContactList(matches.length > 0);
    }, 200);
    return () => clearTimeout(t);
  }, [contactQuery, contactsCache]);

  const selectAccount = (acc) => {
    setFormData(prev => ({ ...prev, account: acc.name }));
    setAccountQuery(acc.name);
    setShowAccountList(false);
  };

  const selectContact = (c) => {
    const name = c.mainContact || c.name;
    setFormData(prev => ({ ...prev, primary_contact: name }));
    setContactQuery(name);
    setShowContactList(false);
  };

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
                <div className="space-y-2 relative">
                  <Label htmlFor="account">Account</Label>
                  <Input
                    id="account"
                    name="account"
                    value={accountQuery}
                    onChange={(e) => { setAccountQuery(e.target.value); setShowAccountList(true); setFormData(prev => ({ ...prev, account: e.target.value })); }}
                    placeholder="Type to search account or enter manually"
                  />
                  {showAccountList && accountResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {accountResults.map((a) => (
                        <div key={a._id} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectAccount(a)}>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.accountId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="primary_contact">Primary Contact</Label>
                  <Input
                    id="primary_contact"
                    name="primary_contact"
                    value={contactQuery}
                    onChange={(e) => { setContactQuery(e.target.value); setShowContactList(true); setFormData(prev => ({ ...prev, primary_contact: e.target.value })); }}
                    placeholder="Type to search contact or enter manually"
                  />
                  {showContactList && contactResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {contactResults.map((c) => (
                        <div key={c._id} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectContact(c)}>
                          <div className="font-medium">{c.mainContact}</div>
                          <div className="text-xs text-muted-foreground">{c.email} {c.mobile ? `• ${c.mobile}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
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
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date/Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleInputChange} />
                    <Input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date/Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleInputChange} />
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
                                  <ShadSelect value={formData.owner} onValueChange={val => handleSelectChange("owner", val)}>
                                    <ShadSelectTrigger>
                                      <ShadSelectValue placeholder="Select owner" />
                                    </ShadSelectTrigger>
                                    <ShadSelectContent>
                                      <ShadSelectItem value="user1">user1</ShadSelectItem>
                                      <ShadSelectItem value="user2">user2</ShadSelectItem>
                                      <ShadSelectItem value="user3">user3</ShadSelectItem>
                                    </ShadSelectContent>
                                  </ShadSelect>
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
              <ResizableTable
                columns={[
                  { key: 'subject', label: 'Subject', defaultWidth: 180 },
                  { key: 'account', label: 'Account', defaultWidth: 160 },
                  { key: 'primary_contact', label: 'Primary Contact', defaultWidth: 180 },
                  { key: 'processor', label: 'Processor', defaultWidth: 160 },
                  { key: 'completion', label: 'Completion', defaultWidth: 140 },
                  { key: 'start', label: 'Start', defaultWidth: 180 },
                  { key: 'due', label: 'Due', defaultWidth: 180 },
                  { key: 'category', label: 'Category', defaultWidth: 160 },
                  { key: 'priority', label: 'Priority', defaultWidth: 140 },
                  { key: 'status', label: 'Status', defaultWidth: 140 },
                  { key: 'owner', label: 'Owner', defaultWidth: 140 },
                  { key: 'territory', label: 'Sales Territory', defaultWidth: 180 },
                ]}
                data={paginated}
                visible={visibleColumns}
                onSort={(k) => setSortField(k)}
                renderCell={(row, key) => {
                  if (key === 'completion') return typeof row.completion === 'number' ? `${row.completion}%` : row.completion;
                  if (key === 'start') return row.start ? new Date(row.start).toLocaleString() : '';
                  if (key === 'due') return row.due ? new Date(row.due).toLocaleString() : '';
                  return row[key];
                }}
                minTableWidth={1000}
              />
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


