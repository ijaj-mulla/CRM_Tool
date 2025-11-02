import React, { useState, useEffect } from "react";
import axios from "axios";
import { FormCard } from "@/components/forms/FormCard";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ResizableTable from "@/components/table/ResizableTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronLeft, ChevronRight, Pencil } from "lucide-react";

// Custom wrappers from your project
// Using simple sections without cards to match other pages' form style

const Opportunities = () => {
  const [showForm, setShowForm] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    account: "",
    contact: "",
    salesOrganization: "",
    owner: "user1",
    salesPhase: "qualification",
    startDate: new Date().toISOString().slice(0,10),
    closeDate: "",
    category: "Brochure request",
    expectedValue: "",
    currency: "INR",
    probability: "",
    createdBy: "",
    salesUnit: "",
    salesOffice: "",
    industry: "",
    subIndustry: "",
    source: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);

  const allColumns = [
    { key: 'opportunityId', label: 'Opportunity ID' },
    { key: 'name', label: 'Name' },
    { key: 'account', label: 'Account' },
    { key: 'contact', label: 'Contact' },
    { key: 'salesOrganization', label: 'Sales Org' },
    { key: 'owner', label: 'Owner' },
    { key: 'salesPhase', label: 'Sales Phase' },
    { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'closeDate', label: 'Close Date' },
    { key: 'category', label: 'Category' },
    { key: 'followUpDate', label: 'Follow-Up Date' },
    { key: 'expectedValue', label: 'Expected Value' },
    { key: 'probability', label: 'Probability' },
    { key: 'source', label: 'Source' },
    { key: 'industry', label: 'Industry' },
    { key: 'subIndustry', label: 'Sub Industry' },
    { key: 'salesUnit', label: 'Sales Unit' },
    { key: 'salesOffice', label: 'Sales Office' },
    { key: 'createdBy', label: 'Created By' },
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

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expectedValue: formData.expectedValue !== "" ? Number(formData.expectedValue) : undefined,
        probability: formData.probability !== "" ? Number(formData.probability) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        closeDate: formData.closeDate ? new Date(formData.closeDate) : undefined,
      };

      // Required fields
      const required = ['name','account','contact','owner','startDate','closeDate','category','source'];
      for (const f of required) {
        if (!payload[f]) {
          alert(`Please fill in ${f}.`);
          return;
        }
      }

      await axios.post("http://localhost:5000/api/opportunity", payload);
      setShowForm(false);
      setFormData({
        name: "",
        account: "",
        contact: "",
        salesOrganization: "",
        owner: "user1",
        salesPhase: "qualification",
        startDate: new Date().toISOString().slice(0,10),
        closeDate: "",
        category: "Brochure request",
        expectedValue: "",
        currency: "INR",
        probability: "",
        createdBy: "",
        salesUnit: "",
        salesOffice: "",
        industry: "",
        subIndustry: "",
        source: ""
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

  // Columns config for ResizableTable
  const columnsConfig = [
    { key: 'opportunityId', label: 'Opportunity ID', defaultWidth: 100 },
    { key: 'name', label: 'Name', defaultWidth: 200 },
    { key: 'account', label: 'Account', defaultWidth: 180 },
    { key: 'contact', label: 'Contact', defaultWidth: 180 },
    { key: 'salesOrganization', label: 'Sales Org', defaultWidth: 100 },
    { key: 'owner', label: 'Owner', defaultWidth: 100 },
    { key: 'salesPhase', label: 'Sales Phase', defaultWidth: 120 },
    { key: 'status', label: 'Status', defaultWidth: 120 },
    { key: 'startDate', label: 'Start Date', defaultWidth: 120 },
    { key: 'closeDate', label: 'Close Date', defaultWidth: 120 },
    { key: 'category', label: 'Category', defaultWidth: 190 },
    { key: 'followUpDate', label: 'Follow-Up Date', defaultWidth: 120 },
    { key: 'expectedValue', label: 'Expected Value', defaultWidth: 160 },
    { key: 'probability', label: 'Probability', defaultWidth: 100 },
    { key: 'source', label: 'Source', defaultWidth: 160 },
    { key: 'industry', label: 'Industry', defaultWidth: 160 },
    { key: 'subIndustry', label: 'Sub Industry', defaultWidth: 180 },
    { key: 'salesUnit', label: 'Sales Unit', defaultWidth: 140 },
    { key: 'salesOffice', label: 'Sales Office', defaultWidth: 140 },
    { key: 'createdBy', label: 'Created By', defaultWidth: 140 },
  ];

  const renderCell = (row, key) => {
    if (key === 'name') {
      return editingId === (row._id || row.id) ? (
        <Input value={editData.name} onChange={(e) => updateEdit('name', e.target.value)} />
      ) : (
        row.name
      );
    }
    if (key === 'salesPhase') {
      return editingId === (row._id || row.id) ? (
        <ShadSelect value={editData.salesPhase} onValueChange={(v) => updateEdit('salesPhase', v)}>
          <ShadSelectTrigger><ShadSelectValue placeholder="Select phase" /></ShadSelectTrigger>
          <ShadSelectContent>
            <ShadSelectItem value="qualification">Qualification</ShadSelectItem>
            <ShadSelectItem value="specification">Specification</ShadSelectItem>
            <ShadSelectItem value="quotation">Quotation</ShadSelectItem>
            <ShadSelectItem value="negotiation">Negotiation</ShadSelectItem>
            <ShadSelectItem value="implementation">Implementation</ShadSelectItem>
          </ShadSelectContent>
        </ShadSelect>
      ) : (
        getPhaseBadge(row.salesPhase)
      );
    }
    if (key === 'status') return <Badge variant={row.status === 'Active' ? 'default' : 'outline'}>{row.status || ''}</Badge>;
    if (key === 'startDate') {
      return editingId === (row._id || row.id) ? (
        <Input type="date" value={editData.startDate} onChange={(e) => updateEdit('startDate', e.target.value)} />
      ) : (
        fmtDate(row.startDate)
      );
    }
    if (key === 'closeDate') {
      return editingId === (row._id || row.id) ? (
        <Input type="date" value={editData.closeDate} onChange={(e) => updateEdit('closeDate', e.target.value)} />
      ) : (
        fmtDate(row.closeDate)
      );
    }
    if (key === 'followUpDate') {
      return editingId === (row._id || row.id) ? (
        <Input type="date" value={editData.followUpDate} onChange={(e) => updateEdit('followUpDate', e.target.value)} />
      ) : (
        fmtDate(row.followUpDate)
      );
    }
    if (key === 'expectedValue') {
      return editingId === (row._id || row.id) ? (
        <Input type="number" value={editData.expectedValue} onChange={(e) => updateEdit('expectedValue', e.target.value)} />
      ) : (
        formatAmount(row.expectedValue, row.currency)
      );
    }
    if (key === 'probability') {
      return editingId === (row._id || row.id) ? (
        <Input type="number" min="0" max="100" value={editData.probability} onChange={(e) => updateEdit('probability', e.target.value)} />
      ) : (
        row.probability != null ? `${row.probability}%` : ''
      );
    }
    if (key === 'source') {
      return editingId === (row._id || row.id) ? (
        <ShadSelect value={editData.source} onValueChange={(v) => updateEdit('source', v)}>
          <ShadSelectTrigger><ShadSelectValue placeholder="Select source" /></ShadSelectTrigger>
          <ShadSelectContent>
            <ShadSelectItem value="Customer event/workshop">Customer event/workshop</ShadSelectItem>
            <ShadSelectItem value="Customer visit">Customer visit</ShadSelectItem>
            <ShadSelectItem value="Direct mail">Direct mail</ShadSelectItem>
            <ShadSelectItem value="ePocket">ePocket</ShadSelectItem>
            <ShadSelectItem value="Ext. data sources (incl.ZoomInfo,Hover)">Ext. data sources (incl.ZoomInfo,Hover)</ShadSelectItem>
            <ShadSelectItem value="External Partner">External Partner</ShadSelectItem>
            <ShadSelectItem value="Further configurators">Further configurators</ShadSelectItem>
            <ShadSelectItem value="Further Social Media">Further Social Media</ShadSelectItem>
            <ShadSelectItem value="LinkedIn">LinkedIn</ShadSelectItem>
            <ShadSelectItem value="Meta (incl. Facebook, Instagram)">Meta (incl. Facebook, Instagram)</ShadSelectItem>
            <ShadSelectItem value="Online Shop">Online Shop</ShadSelectItem>
            <ShadSelectItem value="Potential Needs Analysis">Potential Needs Analysis</ShadSelectItem>
            <ShadSelectItem value="RiPanel">RiPanel</ShadSelectItem>
            <ShadSelectItem value="RiPower">RiPower</ShadSelectItem>
            <ShadSelectItem value="RiTherm">RiTherm</ShadSelectItem>
            <ShadSelectItem value="Rittal Application Center">Rittal Application Center</ShadSelectItem>
            <ShadSelectItem value="Rittal Innovation Center">Rittal Innovation Center</ShadSelectItem>
            <ShadSelectItem value="Rittal website (incl. Campaign)">Rittal website (incl. Campaign)</ShadSelectItem>
            <ShadSelectItem value="Roadshow">Roadshow</ShadSelectItem>
            <ShadSelectItem value="Telephone">Telephone</ShadSelectItem>
            <ShadSelectItem value="Trade fair">Trade fair</ShadSelectItem>
            <ShadSelectItem value="Webinar">Webinar</ShadSelectItem>
            <ShadSelectItem value="X (Twitter)">X (Twitter)</ShadSelectItem>
            <ShadSelectItem value="YouTube">YouTube</ShadSelectItem>
          </ShadSelectContent>
        </ShadSelect>
      ) : (
        row.source || ''
      );
    }
    if (key === 'industry') {
      return editingId === (row._id || row.id) ? (
        <ShadSelect value={editData.industry} onValueChange={(v) => updateEdit('industry', v)}>
          <ShadSelectTrigger><ShadSelectValue placeholder="Select industry" /></ShadSelectTrigger>
          <ShadSelectContent>
            <ShadSelectItem value="10 Machinery">10 Machinery</ShadSelectItem>
            <ShadSelectItem value="20 Electrical & Automation">20 Electrical & Automation</ShadSelectItem>
            <ShadSelectItem value="30 Traffic Systems">30 Traffic Systems</ShadSelectItem>
            <ShadSelectItem value="40 Production Plants">40 Production Plants</ShadSelectItem>
            <ShadSelectItem value="50 Process Industries">50 Process Industries</ShadSelectItem>
            <ShadSelectItem value="60 Renewable Energies">60 Renewable Energies</ShadSelectItem>
            <ShadSelectItem value="70 Cities & Infrastructure">70 Cities & Infrastructure</ShadSelectItem>
            <ShadSelectItem value="80 IT">80 IT</ShadSelectItem>
            <ShadSelectItem value="90 Others">90 Others</ShadSelectItem>
          </ShadSelectContent>
        </ShadSelect>
      ) : (
        row.industry || ''
      );
    }
    if (key === 'subIndustry') {
      return editingId === (row._id || row.id) ? (
        <ShadSelect value={editData.subIndustry} onValueChange={(v) => updateEdit('subIndustry', v)}>
          <ShadSelectTrigger><ShadSelectValue placeholder="Select sub-industry" /></ShadSelectTrigger>
          <ShadSelectContent>
            <ShadSelectItem value="10 Machinery others">10 Machinery others</ShadSelectItem>
            <ShadSelectItem value="11 Manufacture of Conveyor technology">11 Manufacture of Conveyor technology</ShadSelectItem>
            <ShadSelectItem value="12 Manufacture of machine-tools">12 Manufacture of machine-tools</ShadSelectItem>
            <ShadSelectItem value="13 Print and paper machinery">13 Print and paper machinery</ShadSelectItem>
            <ShadSelectItem value="14 Machinery for Food and Beverage / Packing / Filling">14 Machinery for Food and Beverage / Packing / Filling</ShadSelectItem>
            <ShadSelectItem value="15 Wood handling machines">15 Wood handling machines</ShadSelectItem>
            <ShadSelectItem value="16 Plastic production machinery">16 Plastic production machinery</ShadSelectItem>
            <ShadSelectItem value="17 Process engineering machinery">17 Process engineering machinery</ShadSelectItem>
            <ShadSelectItem value="18 Manufacture of Turbines & Motors">18 Manufacture of Turbines & Motors</ShadSelectItem>
            <ShadSelectItem value="19 Manufacture of Construction & Mobile Machinery">19 Manufacture of Construction & Mobile Machinery</ShadSelectItem>
            <ShadSelectItem value="20 Electrical & Automation others">20 Electrical & Automation others</ShadSelectItem>
            <ShadSelectItem value="21 Electrical installation">21 Electrical installation</ShadSelectItem>
            <ShadSelectItem value="22 Electronics">22 Electronics</ShadSelectItem>
            <ShadSelectItem value="23 Automation / Measuring and control / Drives systems">23 Automation / Measuring and control / Drives systems</ShadSelectItem>
            <ShadSelectItem value="24 Semiconductor industry">24 Semiconductor industry</ShadSelectItem>
            <ShadSelectItem value="25 Medical technology">25 Medical technology</ShadSelectItem>
            <ShadSelectItem value="26 Nano-technology">26 Nano-technology</ShadSelectItem>
            <ShadSelectItem value="30 Traffic Systems others">30 Traffic Systems others</ShadSelectItem>
            <ShadSelectItem value="31 Automotive Industry">31 Automotive Industry</ShadSelectItem>
            <ShadSelectItem value="32 Part Supplier to Automotive Industry">32 Part Supplier to Automotive Industry</ShadSelectItem>
            <ShadSelectItem value="33 Railway technology">33 Railway technology</ShadSelectItem>
            <ShadSelectItem value="34 Airports">34 Airports</ShadSelectItem>
            <ShadSelectItem value="35 Traffic control instrumentation">35 Traffic control instrumentation</ShadSelectItem>
            <ShadSelectItem value="36 Ship building and ship equipment">36 Ship building and ship equipment</ShadSelectItem>
            <ShadSelectItem value="40 Production Plants others">40 Production Plants others</ShadSelectItem>
            <ShadSelectItem value="41 Food & beverage production">41 Food & beverage production</ShadSelectItem>
            <ShadSelectItem value="42 Manufacture of fabricated metal products">42 Manufacture of fabricated metal products</ShadSelectItem>
            <ShadSelectItem value="43 Precision mechanics, optical instruments, watches">43 Precision mechanics, optical instruments, watches</ShadSelectItem>
            <ShadSelectItem value="44 Printing">44 Printing</ShadSelectItem>
            <ShadSelectItem value="45 Manufacture of wood products">45 Manufacture of wood products</ShadSelectItem>
            <ShadSelectItem value="46 Manufacture of textiles / wearing apparel / leather">46 Manufacture of textiles / wearing apparel / leather</ShadSelectItem>
            <ShadSelectItem value="47 Manufacture of Stone / Clay / Glass / Concrete products">47 Manufacture of Stone / Clay / Glass / Concrete products</ShadSelectItem>
            <ShadSelectItem value="50 Process Industries others">50 Process Industries others</ShadSelectItem>
            <ShadSelectItem value="51 Chemical industry">51 Chemical industry</ShadSelectItem>
            <ShadSelectItem value="52 Plastic industry">52 Plastic industry</ShadSelectItem>
            <ShadSelectItem value="53 Rafinery, petroleum, natural gas, refined petroleum products">53 Rafinery, petroleum, natural gas, refined petroleum products</ShadSelectItem>
            <ShadSelectItem value="54 Pharma / biotechnology / genetic engineering">54 Pharma / biotechnology / genetic engineering</ShadSelectItem>
            <ShadSelectItem value="55 Mining of metal ores / stones / cement / glass">55 Mining of metal ores / stones / cement / glass</ShadSelectItem>
            <ShadSelectItem value="56 Manufacture of basic metals and steel">56 Manufacture of basic metals and steel</ShadSelectItem>
            <ShadSelectItem value="57 Mining of coal">57 Mining of coal</ShadSelectItem>
            <ShadSelectItem value="58 Pulp and paper production">58 Pulp and paper production</ShadSelectItem>
            <ShadSelectItem value="60 others">60 others</ShadSelectItem>
            <ShadSelectItem value="61 Renewable energy / Solar energy">61 Renewable energy / Solar energy</ShadSelectItem>
            <ShadSelectItem value="62 Renewable energy / Wind energy">62 Renewable energy / Wind energy</ShadSelectItem>
            <ShadSelectItem value="63 Renewable energy / Hydro Power">63 Renewable energy / Hydro Power</ShadSelectItem>
            <ShadSelectItem value="64 Renewable energy / Biomass">64 Renewable energy / Biomass</ShadSelectItem>
            <ShadSelectItem value="70 Cities & Infrastructure others">70 Cities & Infrastructure others</ShadSelectItem>
            <ShadSelectItem value="71 Power stations (electrical, gas, heat)">71 Power stations (electrical, gas, heat)</ShadSelectItem>
            <ShadSelectItem value="72 Waste incineration / recycling">72 Waste incineration / recycling</ShadSelectItem>
            <ShadSelectItem value="73 water / waste water">73 water / waste water</ShadSelectItem>
            <ShadSelectItem value="74 Public Authorities (government, public administration, universities, institutes, hospitals & social institutions)">74 Public Authorities (government, public administration, universities, institutes, hospitals & social institutions)</ShadSelectItem>
            <ShadSelectItem value="75 Banks and insurance companies">75 Banks and insurance companies</ShadSelectItem>
            <ShadSelectItem value="76 Heating, Ventilation, Air conditioning">76 Heating, Ventilation, Air conditioning</ShadSelectItem>
            <ShadSelectItem value="77 Telecommunications (telephone network / cell phone network)">77 Telecommunications (telephone network / cell phone network)</ShadSelectItem>
            <ShadSelectItem value="78 Radio and television (transmission eg.)">78 Radio and television (transmission eg.)</ShadSelectItem>
            <ShadSelectItem value="80 IT others">80 IT others</ShadSelectItem>
            <ShadSelectItem value="81 IT OEM's / Hardwareproduction">81 IT OEM's / Hardwareproduction</ShadSelectItem>
            <ShadSelectItem value="82 IT System Integrator / Services / Consulting">82 IT System Integrator / Services / Consulting</ShadSelectItem>
            <ShadSelectItem value="83 IT Distribution / Reseller / Retailer">83 IT Distribution / Reseller / Retailer</ShadSelectItem>
            <ShadSelectItem value="84 Hosting / Co-Location / Provider">84 Hosting / Co-Location / Provider</ShadSelectItem>
            <ShadSelectItem value="90 Others">90 Others</ShadSelectItem>
            <ShadSelectItem value="91 Construction">91 Construction</ShadSelectItem>
            <ShadSelectItem value="92 Military">92 Military</ShadSelectItem>
            <ShadSelectItem value="93 Services">93 Services</ShadSelectItem>
            <ShadSelectItem value="94 Agricultural goods">94 Agricultural goods</ShadSelectItem>
            <ShadSelectItem value="95 Retail">95 Retail</ShadSelectItem>
          </ShadSelectContent>
        </ShadSelect>
      ) : (
        row.subIndustry || ''
      );
    }
    if (key === 'createdBy') {
      return editingId === (row._id || row.id) ? (
        <Input value={editData.createdBy || ''} onChange={(e) => updateEdit('createdBy', e.target.value)} />
      ) : (
        row.createdBy || ''
      );
    }
    return row[key];
  };

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (row) => {
    setEditingId(row._id || row.id);
    setEditData({
      name: row.name || "",
      salesPhase: row.salesPhase || "qualification",
      startDate: fmtDate(row.startDate) || new Date().toISOString().slice(0,10),
      closeDate: fmtDate(row.closeDate) || "",
      expectedValue: row.expectedValue ?? "",
      probability: row.probability ?? "",
      followUpDate: fmtDate(row.followUpDate) || new Date().toISOString().slice(0,10),
      industry: row.industry || "",
      subIndustry: row.subIndustry || "",
      source: row.source || "",
      createdBy: row.createdBy || "",
    });
  };

  const updateEdit = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (row) => {
    try {
      const id = row._id || row.id;
      await axios.put(`http://localhost:5000/api/opportunity/${id}`, {
        ...editData,
        startDate: editData.startDate ? new Date(editData.startDate) : undefined,
        closeDate: editData.closeDate ? new Date(editData.closeDate) : undefined,
        followUpDate: editData.followUpDate ? new Date(editData.followUpDate) : undefined,
        expectedValue: editData.expectedValue === "" ? undefined : Number(editData.expectedValue),
        probability: editData.probability === "" ? undefined : Number(editData.probability),
      });
      setEditingId(null);
      setEditData({});
      fetchOpportunities();
    } catch (e) {
      alert("Failed to update opportunity: " + (e.response?.data || e.message));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const getPhaseBadge = (phase) => {
    const p = (phase || '').toLowerCase();
    const variant = p === 'negotiation' ? 'destructive' : p === 'quotation' ? 'default' : p === 'specification' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{phase}</Badge>;
  };

  const formatAmount = (amount, currency) => {
    if (amount == null || amount === "") return "";
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format(amount);
    } catch {
      return `${currency || 'INR'} ${amount}`;
    }
  };

  const fmtDate = (d) => {
    if (!d) return "";
    try {
      const s = typeof d === 'string' ? d : new Date(d).toISOString();
      return s.slice(0, 10);
    } catch { return String(d); }
  };

  // Live search like Leads
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState([]);
  const [showContactList, setShowContactList] = useState(false);
  const [accountQuery, setAccountQuery] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [showAccountList, setShowAccountList] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!contactQuery) { setContactResults([]); return; }
      try {
        const res = await axios.get(`http://localhost:5000/api/opportunity/search/contact?q=${encodeURIComponent(contactQuery)}`);
        setContactResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [contactQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!accountQuery) { setAccountResults([]); return; }
      try {
        const res = await axios.get(`http://localhost:5000/api/opportunity/search/account?q=${encodeURIComponent(accountQuery)}`);
        setAccountResults(res.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [accountQuery]);

  const selectContact = (c) => {
    setFormData(prev => ({ ...prev, contact: c.name || prev.contact }));
    setContactQuery(c.name || "");
    setShowContactList(false);
  };
  const selectAccount = (a) => {
    setFormData(prev => ({ ...prev, account: a.name || prev.account }));
    setAccountQuery(a.name || "");
    setShowAccountList(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <FormCard title="Opportunity Information">
            <form onSubmit={handleSubmit}>
              <FormSection title="General Details">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" name="account" value={accountQuery} onChange={(e) => { setAccountQuery(e.target.value); setShowAccountList(true); setFormData(prev => ({ ...prev, account: e.target.value })); }} placeholder="Type to search account or enter manually" required />
                  {showAccountList && accountResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {accountResults.map((a, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectAccount(a)}>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{[a.city,a.state,a.country].filter(Boolean).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesOrganization">Sales Organization</Label>
                  <Input id="salesOrganization" name="salesOrganization" value={formData.salesOrganization} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <ShadSelect value={formData.owner} onValueChange={val => handleSelectChange("owner", val)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select owner" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="user1">user1</ShadSelectItem>
                      <ShadSelectItem value="user2">user2</ShadSelectItem>
                      <ShadSelectItem value="user3">user3</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesPhase">Sales Phase</Label>
                  <ShadSelect value={formData.salesPhase} onValueChange={val => handleSelectChange("salesPhase", val)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select phase" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="qualification">Qualification</ShadSelectItem>
                      <ShadSelectItem value="specification">Specification</ShadSelectItem>
                      <ShadSelectItem value="quotation">Quotation</ShadSelectItem>
                      <ShadSelectItem value="negotiation">Negotiation</ShadSelectItem>
                      <ShadSelectItem value="implementation">Implementation</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <ShadSelect value={formData.industry} onValueChange={val => handleSelectChange("industry", val)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select industry" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="10 Machinery">10 Machinery</ShadSelectItem>
                      <ShadSelectItem value="20 Electrical & Automation">20 Electrical & Automation</ShadSelectItem>
                      <ShadSelectItem value="30 Traffic Systems">30 Traffic Systems</ShadSelectItem>
                      <ShadSelectItem value="40 Production Plants">40 Production Plants</ShadSelectItem>
                      <ShadSelectItem value="50 Process Industries">50 Process Industries</ShadSelectItem>
                      <ShadSelectItem value="60 Renewable Energies">60 Renewable Energies</ShadSelectItem>
                      <ShadSelectItem value="70 Cities & Infrastructure">70 Cities & Infrastructure</ShadSelectItem>
                      <ShadSelectItem value="80 IT">80 IT</ShadSelectItem>
                      <ShadSelectItem value="90 Others">90 Others</ShadSelectItem>
                    </ShadSelectContent>

                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subIndustry">Sub Industry</Label>
                  <ShadSelect value={formData.subIndustry} onValueChange={val => handleSelectChange("subIndustry", val)}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select sub-industry" /></ShadSelectTrigger>
                   <ShadSelectContent>
                      <ShadSelectItem value="10 Machinery others">10 Machinery others</ShadSelectItem>
                      <ShadSelectItem value="11 Manufacture of Conveyor technology">11 Manufacture of Conveyor technology</ShadSelectItem>
                      <ShadSelectItem value="12 Manufacture of machine-tools">12 Manufacture of machine-tools</ShadSelectItem>
                      <ShadSelectItem value="13 Print and paper machinery">13 Print and paper machinery</ShadSelectItem>
                      <ShadSelectItem value="14 Machinery for Food and Beverage / Packing / Filling">14 Machinery for Food and Beverage / Packing / Filling</ShadSelectItem>
                      <ShadSelectItem value="15 Wood handling machines">15 Wood handling machines</ShadSelectItem>
                      <ShadSelectItem value="16 Plastic production machinery">16 Plastic production machinery</ShadSelectItem>
                      <ShadSelectItem value="17 Process engineering machinery">17 Process engineering machinery</ShadSelectItem>
                      <ShadSelectItem value="18 Manufacture of Turbines & Motors">18 Manufacture of Turbines & Motors</ShadSelectItem>
                      <ShadSelectItem value="19 Manufacture of Construction & Mobile Machinery">19 Manufacture of Construction & Mobile Machinery</ShadSelectItem>
                      <ShadSelectItem value="20 Electrical & Automation others">20 Electrical & Automation others</ShadSelectItem>
                      <ShadSelectItem value="21 Electrical installation">21 Electrical installation</ShadSelectItem>
                      <ShadSelectItem value="22 Electronics">22 Electronics</ShadSelectItem>
                      <ShadSelectItem value="23 Automation / Measuring and control / Drives systems">23 Automation / Measuring and control / Drives systems</ShadSelectItem>
                      <ShadSelectItem value="24 Semiconductor industry">24 Semiconductor industry</ShadSelectItem>
                      <ShadSelectItem value="25 Medical technology">25 Medical technology</ShadSelectItem>
                      <ShadSelectItem value="26 Nano-technology">26 Nano-technology</ShadSelectItem>
                      <ShadSelectItem value="30 Traffic Systems others">30 Traffic Systems others</ShadSelectItem>
                      <ShadSelectItem value="31 Automotive Industry">31 Automotive Industry</ShadSelectItem>
                      <ShadSelectItem value="32 Part Supplier to Automotive Industry">32 Part Supplier to Automotive Industry</ShadSelectItem>
                      <ShadSelectItem value="33 Railway technology">33 Railway technology</ShadSelectItem>
                      <ShadSelectItem value="34 Airports">34 Airports</ShadSelectItem>
                      <ShadSelectItem value="35 Traffic control instrumentation">35 Traffic control instrumentation</ShadSelectItem>
                      <ShadSelectItem value="36 Ship building and ship equipment">36 Ship building and ship equipment</ShadSelectItem>
                      <ShadSelectItem value="40 Production Plants others">40 Production Plants others</ShadSelectItem>
                      <ShadSelectItem value="41 Food & beverage production">41 Food & beverage production</ShadSelectItem>
                      <ShadSelectItem value="42 Manufacture of fabricated metal products">42 Manufacture of fabricated metal products</ShadSelectItem>
                      <ShadSelectItem value="43 Precision mechanics, optical instruments, watches">43 Precision mechanics, optical instruments, watches</ShadSelectItem>
                      <ShadSelectItem value="44 Printing">44 Printing</ShadSelectItem>
                      <ShadSelectItem value="45 Manufacture of wood products">45 Manufacture of wood products</ShadSelectItem>
                      <ShadSelectItem value="46 Manufacture of textiles / wearing apparel / leather">46 Manufacture of textiles / wearing apparel / leather</ShadSelectItem>
                      <ShadSelectItem value="47 Manufacture of Stone / Clay / Glass / Concrete products">47 Manufacture of Stone / Clay / Glass / Concrete products</ShadSelectItem>
                      <ShadSelectItem value="50 Process Industries others">50 Process Industries others</ShadSelectItem>
                      <ShadSelectItem value="51 Chemical industry">51 Chemical industry</ShadSelectItem>
                      <ShadSelectItem value="52 Plastic industry">52 Plastic industry</ShadSelectItem>
                      <ShadSelectItem value="53 Rafinery, petroleum, natural gas, refined petroleum products">53 Rafinery, petroleum, natural gas, refined petroleum products</ShadSelectItem>
                      <ShadSelectItem value="54 Pharma / biotechnology / genetic engineering">54 Pharma / biotechnology / genetic engineering</ShadSelectItem>
                      <ShadSelectItem value="55 Mining of metal ores / stones / cement / glass">55 Mining of metal ores / stones / cement / glass</ShadSelectItem>
                      <ShadSelectItem value="56 Manufacture of basic metals and steel">56 Manufacture of basic metals and steel</ShadSelectItem>
                      <ShadSelectItem value="57 Mining of coal">57 Mining of coal</ShadSelectItem>
                      <ShadSelectItem value="58 Pulp and paper production">58 Pulp and paper production</ShadSelectItem>
                      <ShadSelectItem value="60 others">60 others</ShadSelectItem>
                      <ShadSelectItem value="61 Renewable energy / Solar energy">61 Renewable energy / Solar energy</ShadSelectItem>
                      <ShadSelectItem value="62 Renewable energy / Wind energy">62 Renewable energy / Wind energy</ShadSelectItem>
                      <ShadSelectItem value="63 Renewable energy / Hydro Power">63 Renewable energy / Hydro Power</ShadSelectItem>
                      <ShadSelectItem value="64 Renewable energy / Biomass">64 Renewable energy / Biomass</ShadSelectItem>
                      <ShadSelectItem value="65 Renewable energy / Energy storage / Fuel cell">65 Renewable energy / Energy storage / Fuel cell</ShadSelectItem>
                      <ShadSelectItem value="70 Cities & Infrastructure others">70 Cities & Infrastructure others</ShadSelectItem>
                      <ShadSelectItem value="71 Power stations (electrical, gas, heat)">71 Power stations (electrical, gas, heat)</ShadSelectItem>
                      <ShadSelectItem value="72 Waste incineration / recycling">72 Waste incineration / recycling</ShadSelectItem>
                      <ShadSelectItem value="73 water / waste water">73 water / waste water</ShadSelectItem>
                      <ShadSelectItem value="74 Public Authorities (government, public administration, universities, institutes, hospitals & social institutions)">74 Public Authorities (government, public administration, universities, institutes, hospitals & social institutions)</ShadSelectItem>
                      <ShadSelectItem value="75 Banks and insurance companies">75 Banks and insurance companies</ShadSelectItem>
                      <ShadSelectItem value="76 Heating, Ventilation, Air conditioning">76 Heating, Ventilation, Air conditioning</ShadSelectItem>
                      <ShadSelectItem value="77 Telecommunications (telephone network / cell phone network)">77 Telecommunications (telephone network / cell phone network)</ShadSelectItem>
                      <ShadSelectItem value="78 Radio and television (transmission eg.)">78 Radio and television (transmission eg.)</ShadSelectItem>
                      <ShadSelectItem value="80 IT others">80 IT others</ShadSelectItem>
                      <ShadSelectItem value="81 IT OEM's / Hardwareproduction">81 IT OEM's / Hardwareproduction</ShadSelectItem>
                      <ShadSelectItem value="82 IT System Integrator / Services / Consulting">82 IT System Integrator / Services / Consulting</ShadSelectItem>
                      <ShadSelectItem value="83 IT Distribution / Reseller / Retailer">83 IT Distribution / Reseller / Retailer</ShadSelectItem>
                      <ShadSelectItem value="84 Hosting / Co-Location / Provider">84 Hosting / Co-Location / Provider</ShadSelectItem>
                      <ShadSelectItem value="90 Others">90 Others</ShadSelectItem>
                      <ShadSelectItem value="91 Construction">91 Construction</ShadSelectItem>
                      <ShadSelectItem value="92 Military">92 Military</ShadSelectItem>
                      <ShadSelectItem value="93 Services">93 Services</ShadSelectItem>
                      <ShadSelectItem value="94 Agricultural goods">94 Agricultural goods</ShadSelectItem>
                      <ShadSelectItem value="95 Retail">95 Retail</ShadSelectItem>
                    </ShadSelectContent>

                  </ShadSelect>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="contact">Contact</Label>
                  <Input id="contact" name="contact" value={contactQuery} onChange={(e) => { setContactQuery(e.target.value); setShowContactList(true); setFormData(prev => ({ ...prev, contact: e.target.value })); }} placeholder="Type to search contact or enter manually" required />
                  {showContactList && contactResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded shadow max-h-48 overflow-auto">
                      {contactResults.map((c, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => selectContact(c)}>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email} {c.mobile ? `• ${c.mobile}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <ShadSelect value={formData.source} onValueChange={val => handleSelectChange("source", val)}>
                    <ShadSelectTrigger>
                      <ShadSelectValue placeholder="Select source" />
                    </ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Customer event/workshop">Customer event/workshop</ShadSelectItem>
                      <ShadSelectItem value="Customer visit">Customer visit</ShadSelectItem>
                      <ShadSelectItem value="Direct mail">Direct mail</ShadSelectItem>
                      <ShadSelectItem value="ePocket">ePocket</ShadSelectItem>
                      <ShadSelectItem value="Ext. data sources (incl.ZoomInfo,Hover)">Ext. data sources (incl.ZoomInfo,Hover)</ShadSelectItem>
                      <ShadSelectItem value="External Partner">External Partner</ShadSelectItem>
                      <ShadSelectItem value="Further configurators">Further configurators</ShadSelectItem>
                      <ShadSelectItem value="Further Social Media">Further Social Media</ShadSelectItem>
                      <ShadSelectItem value="LinkedIn">LinkedIn</ShadSelectItem>
                      <ShadSelectItem value="Meta (incl. Facebook, Instagram)">Meta (incl. Facebook, Instagram)</ShadSelectItem>
                      <ShadSelectItem value="Online Shop">Online Shop</ShadSelectItem>
                      <ShadSelectItem value="Potential Needs Analysis">Potential Needs Analysis</ShadSelectItem>
                      <ShadSelectItem value="RiPanel">RiPanel</ShadSelectItem>
                      <ShadSelectItem value="RiPower">RiPower</ShadSelectItem>
                      <ShadSelectItem value="RiTherm">RiTherm</ShadSelectItem>
                      <ShadSelectItem value="Rittal Application Center">Rittal Application Center</ShadSelectItem>
                      <ShadSelectItem value="Rittal Innovation Center">Rittal Innovation Center</ShadSelectItem>
                      <ShadSelectItem value="Rittal website (incl. Campaign)">Rittal website (incl. Campaign)</ShadSelectItem>
                      <ShadSelectItem value="Roadshow">Roadshow</ShadSelectItem>
                      <ShadSelectItem value="Telephone">Telephone</ShadSelectItem>
                      <ShadSelectItem value="Trade fair">Trade fair</ShadSelectItem>
                      <ShadSelectItem value="Webinar">Webinar</ShadSelectItem>
                      <ShadSelectItem value="X (Twitter)">X (Twitter)</ShadSelectItem>
                      <ShadSelectItem value="YouTube">YouTube</ShadSelectItem>
                    </ShadSelectContent>

                  </ShadSelect>
                </div>
              </FormSection>

              <FormSection title="Dates & Financials">
                <div className="space-y-2">
                  <Label htmlFor="expectedValue">Expected Value</Label>
                  <Input id="expectedValue" name="expectedValue" type="number" value={formData.expectedValue} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <ShadSelect value={formData.currency} onValueChange={val => handleSelectChange("currency", val)}>
                    <ShadSelectTrigger className="h-8 px-2">
                      <ShadSelectValue placeholder="Select currency" />
                    </ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="USD">USD</ShadSelectItem>
                      <ShadSelectItem value="EUR">EUR</ShadSelectItem>
                      <ShadSelectItem value="INR">INR</ShadSelectItem>
                      <ShadSelectItem value="GBP">GBP</ShadSelectItem>
                      <ShadSelectItem value="JPY">JPY</ShadSelectItem>
                      <ShadSelectItem value="CNY">CNY</ShadSelectItem>
                      <ShadSelectItem value="AUD">AUD</ShadSelectItem>
                      <ShadSelectItem value="CAD">CAD</ShadSelectItem>
                      <ShadSelectItem value="CHF">CHF</ShadSelectItem>
                      <ShadSelectItem value="AED">AED</ShadSelectItem>
                      <ShadSelectItem value="SAR">SAR</ShadSelectItem>
                      <ShadSelectItem value="SGD">SGD</ShadSelectItem>
                      <ShadSelectItem value="HKD">HKD</ShadSelectItem>
                      <ShadSelectItem value="NZD">NZD</ShadSelectItem>
                      <ShadSelectItem value="SEK">SEK</ShadSelectItem>
                      <ShadSelectItem value="NOK">NOK</ShadSelectItem>
                      <ShadSelectItem value="DKK">DKK</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input id="probability" name="probability" type="number" min="0" max="100" value={formData.probability} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeDate">Close Date</Label>
                  <Input id="closeDate" name="closeDate" type="date" value={formData.closeDate} onChange={handleInputChange} />
                </div>
              </FormSection>

              <FormSection title="Classification">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <ShadSelect value={formData.category} onValueChange={val => handleSelectChange("category", val)}>
                    <ShadSelectTrigger>
                      <ShadSelectValue placeholder="Select category" />
                    </ShadSelectTrigger>
                    <ShadSelectContent>
                      <ShadSelectItem value="Brochure request">Brochure request</ShadSelectItem>
                      <ShadSelectItem value="Prospect for Consulting">Prospect for Consulting</ShadSelectItem>
                      <ShadSelectItem value="Prospect for Product Sales">Prospect for Product Sales</ShadSelectItem>
                      <ShadSelectItem value="Prospect for Service">Prospect for Service</ShadSelectItem>
                      <ShadSelectItem value="Prospect for Training">Prospect for Training</ShadSelectItem>
                      <ShadSelectItem value="Value Chain">Value Chain</ShadSelectItem>
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
              </FormSection>

              <FormSection title="Additional Details">
                <div className="space-y-2">
                  <Label htmlFor="createdBy">Created By</Label>
                  <Input id="createdBy" name="createdBy" value={formData.createdBy} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesUnit">Sales Unit</Label>
                  <Input id="salesUnit" name="salesUnit" value={formData.salesUnit} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesOffice">Sales Office</Label>
                  <Input id="salesOffice" name="salesOffice" value={formData.salesOffice} onChange={handleInputChange} />
                </div>
              </FormSection>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Opportunity</Button>
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
              <ResizableTable
                columns={columnsConfig}
                data={paginatedOpportunities}
                visible={visibleColumns}
                onSort={handleSort}
                renderCell={renderCell}
                actions={{
                  header: 'Actions',
                  cell: (op) => (
                    editingId === (op._id || op.id) ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(op)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => startEdit(op)} aria-label="Edit opportunity">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )
                  )
                }}
                minTableWidth={1000}
              />
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
