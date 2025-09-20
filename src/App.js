import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import {
  ThemeProvider
} from '@mui/material/styles';
import {
  CssBaseline
} from '@mui/material';
import {
  theme
} from './theme/theme';
import {
  MUILayout
} from './components/layout/MUILayout';
import MUIAccounts from './pages/customers/MUIAccounts';
import MUIContacts from './pages/customers/MUIContacts';
import MUILeads from './pages/sales/MUILeads';
function App() {
  return ( <ThemeProvider theme={
    theme
  }>
  <CssBaseline />
  <Router>
  <MUILayout>
  <Routes>
  <Route path="/" element={
    <div style={
      {
        padding: '24px'
      }
    }>Dashboard - Coming Soon</div>
  } />
  <Route path="/dashboard" element={
    <div style={
      {
        padding: '24px'
      }
    }>Dashboard - Coming Soon</div>
  } />
  <Route path="/calendar" element={
    <div style={
      {
        padding: '24px'
      }
    }>Calendar - Coming Soon</div>
  } />
  <Route path="/customers/accounts" element={
    <MUIAccounts />
  } />
  <Route path="/customers/contacts" element={
    <MUIContacts />
  } />
  <Route path="/customers/hierarchy" element={
    <div style={
      {
        padding: '24px'
      }
    }>Account Hierarchy - Coming Soon</div>
  } />
  <Route path="/sales/leads" element={
    <MUILeads />
  } />
  <Route path="/sales/opportunities" element={
    <div style={
      {
        padding: '24px'
      }
    }>Opportunities - Coming Soon</div>
  } />
  <Route path="/sales/quotes" element={
    <div style={
      {
        padding: '24px'
      }
    }>Sales Quotes - Coming Soon</div>
  } />
  <Route path="/sales/orders" element={
    <div style={
      {
        padding: '24px'
      }
    }>Sales Orders - Coming Soon</div>
  } />
  <Route path="/activities/appointments" element={
    <div style={
      {
        padding: '24px'
      }
    }>Appointments - Coming Soon</div>
  } />
  <Route path="/activities/emails" element={
    <div style={
      {
        padding: '24px'
      }
    }>E-Mails - Coming Soon</div>
  } />
  <Route path="/activities/tasks" element={
    <div style={
      {
        padding: '24px'
      }
    }>Tasks - Coming Soon</div>
  } />
  <Route path="/visits" element={
    <div style={
      {
        padding: '24px'
      }
    }>Visits - Coming Soon</div>
  } />
  <Route path="/integrations/email" element={
    <div style={
      {
        padding: '24px'
      }
    }>Email Integration - Coming Soon</div>
  } />
  <Route path="/integrations/google" element={
    <div style={
      {
        padding: '24px'
      }
    }>Google Leads Integration - Coming Soon</div>
  } />
  <Route path="/admin" element={
    <div style={
      {
        padding: '24px'
      }
    }>Admin / Settings - Coming Soon</div>
  } />
  </Routes>
  </MUILayout>
  </Router>
  </ThemeProvider> );
} export default App;
