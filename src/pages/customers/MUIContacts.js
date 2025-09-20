import React,
{
  useState
} from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  MUIToolbar
} from '../../components/layout/MUIToolbar';
const MUIContacts = () => {
  ;
  const theme = useTheme();
  const [showForm,
  setShowForm] = useState(false);
  const [contacts,
  setContacts] = useState([ {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@abc.com',
    phone: '+1-555-0123',
    mobile: '+1-555-0124',
    role: 'CEO'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@xyz.com',
    phone: '+1-555-0125',
    mobile: '+1-555-0126',
    role: 'CTO'
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.brown@global.com',
    phone: '+1-555-0127',
    mobile: '+1-555-0128',
    role: 'VP Sales'
  } ]);
  const [formData,
  setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: ''
  });
  const handleToolbarAction = (action) => {
    if (action === 'add') {
      setShowForm(true);
    }
  };
  const handleInputChange = (field,
  value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setContacts(prev => [...prev,
    {
      ...formData,
      id: Date.now()
    }]);
    setFormData({
      name: '',
      email: '',
      phone: '',
      mobile: '',
      address: ''
    });
    setShowForm(false);
  };
  const handleCancel = () => {
    setShowForm(false);
  };
  if (showForm) {
    return ( <Box>
    <MUIToolbar title="Contacts - New Contact" onAction={
      handleToolbarAction
    } />
    <Box sx={
      {
        p: 3
      }
    }>
    <Paper sx={
      {
        p: 3
      }
    }>
    <Typography variant="h5" gutterBottom color="primary" fontWeight="bold"> Contact Information </Typography>
    <form onSubmit={
      handleSubmit
    }>
    <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Contact Details </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Name" value={
      formData.name
    } onChange={
      (e) => handleInputChange('name',
      e.target.value)
    } variant="outlined" />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Email" type="email" value={
      formData.email
    } onChange={
      (e) => handleInputChange('email',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Phone" value={
      formData.phone
    } onChange={
      (e) => handleInputChange('phone',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Mobile" value={
      formData.mobile
    } onChange={
      (e) => handleInputChange('mobile',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    }>
    <TextField fullWidth label="Address" value={
      formData.address
    } onChange={
      (e) => handleInputChange('address',
      e.target.value)
    } />
    </Grid>
    </Grid>
    <Box sx={
      {
        mt: 4,
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end'
      }
    }>
    <Button variant="outlined" onClick={
      handleCancel
    }> Cancel </Button>
    <Button variant="contained" type="submit"> Save Contact </Button>
    </Box>
    </form>
    </Paper>
    </Box>
    </Box> );
  } return ( <Box>
  <MUIToolbar title="Contacts" onAction={
    handleToolbarAction
  } />
  <Box sx={
    {
      p: 3
    }
  }>
  <Paper>
  <TableContainer>
  <Table>
  <TableHead>
  <TableRow>
  <TableCell>Name</TableCell>
  <TableCell>Email</TableCell>
  <TableCell>Phone</TableCell>
  <TableCell>Mobile</TableCell>
  <TableCell>Role</TableCell>
  </TableRow>
  </TableHead>
  <TableBody> {
    contacts.length === 0 ? ( <TableRow>
    <TableCell colSpan={
      5
    } align="center" sx={
      {
        py: 4
      }
    }>
    <Typography color="textSecondary"> No contacts found. Click the Add button to create your first contact. </Typography>
    </TableCell>
    </TableRow> ) : ( contacts.map((contact) => ( <TableRow key={
      contact.id
    }>
    <TableCell>{
      contact.name
    }</TableCell>
    <TableCell>{
      contact.email
    }</TableCell>
    <TableCell>{
      contact.phone
    }</TableCell>
    <TableCell>{
      contact.mobile
    }</TableCell>
    <TableCell>{
      contact.role
    }</TableCell>
    </TableRow> )) )
  } </TableBody>
  </Table>
  </TableContainer>
  </Paper>
  </Box>
  </Box> );
};
export default MUIContacts;
