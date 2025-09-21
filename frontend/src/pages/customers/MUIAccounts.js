import React,
{
  useState
} from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MUIToolbar
} from '../../components/layout/MUIToolbar';
const MUIAccounts = () => {
  ;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showForm,
  setShowForm] = useState(false);
  const [accounts,
  setAccounts] = useState([ {
    id: 1,
    accountName: 'ABC Corporation',
    accountType: 'customer',
    website: 'www.abc.com',
    industryHorizontal: 'Technology',
    owner: 'John Doe'
  },
  {
    id: 2,
    accountName: 'XYZ Manufacturing Ltd',
    accountType: 'prospect',
    website: 'www.xyz-mfg.com',
    industryHorizontal: 'Manufacturing',
    owner: 'Jane Smith'
  },
  {
    id: 3,
    accountName: 'Global Services Inc',
    accountType: 'partner',
    website: 'www.globalservices.com',
    industryHorizontal: 'Services',
    owner: 'Mike Johnson'
  } ]);
  const [formData,
  setFormData] = useState({
    accountId: '',
    accountType: '',
    accountName: '',
    additionalName: '',
    prospectRole: '',
    website: '',
    salesOrganization: '',
    buAssignment: '',
    horizontalCategory: '',
    verticalCategory: '',
    subVerticalCategory: '',
    languagePreference: '',
    country: '',
    postalCode: '',
    city: '',
    state: '',
    district: '',
    street: '',
    houseNumber: '',
    overrideTerritory: '',
    territory: '',
    owner: '',
    taxCountry: '',
    taxNumberType: '',
    taxNumber: ''
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
    setAccounts(prev => [...prev,
    {
      ...formData,
      id: Date.now()
    }]);
    setFormData({
      accountId: '',
      accountType: '',
      accountName: '',
      additionalName: '',
      prospectRole: '',
      website: '',
      salesOrganization: '',
      buAssignment: '',
      horizontalCategory: '',
      verticalCategory: '',
      subVerticalCategory: '',
      languagePreference: '',
      country: '',
      postalCode: '',
      city: '',
      state: '',
      district: '',
      street: '',
      houseNumber: '',
      overrideTerritory: '',
      territory: '',
      owner: '',
      taxCountry: '',
      taxNumberType: '',
      taxNumber: ''
    });
    setShowForm(false);
  };
  const handleCancel = () => {
    setShowForm(false);
  };
  if (showForm) {
    return ( <Box>
    <MUIToolbar title="Accounts - New Account" onAction={
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
    <Typography variant="h5" gutterBottom color="primary" fontWeight="bold"> Account Information </Typography>
    <form onSubmit={
      handleSubmit
    }> {
      /* Account Information Section */
    } <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Account Information </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Account ID" value={
      formData.accountId
    } onChange={
      (e) => handleInputChange('accountId',
      e.target.value)
    } variant="outlined" />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <FormControl fullWidth>
    <InputLabel>Account Type</InputLabel>
    <Select value={
      formData.accountType
    } onChange={
      (e) => handleInputChange('accountType',
      e.target.value)
    } label="Account Type" >
    <MenuItem value="customer">Customer</MenuItem>
    <MenuItem value="prospect">Prospect</MenuItem>
    <MenuItem value="partner">Partner</MenuItem>
    </Select>
    </FormControl>
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Account Name" value={
      formData.accountName
    } onChange={
      (e) => handleInputChange('accountName',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Additional Name" value={
      formData.additionalName
    } onChange={
      (e) => handleInputChange('additionalName',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Prospect Role" value={
      formData.prospectRole
    } onChange={
      (e) => handleInputChange('prospectRole',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Website" value={
      formData.website
    } onChange={
      (e) => handleInputChange('website',
      e.target.value)
    } />
    </Grid>
    </Grid> {
      /* Sales & Business Details Section */
    } <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Sales & Business Details </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Sales Organization" value={
      formData.salesOrganization
    } onChange={
      (e) => handleInputChange('salesOrganization',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="BU Assignment" value={
      formData.buAssignment
    } onChange={
      (e) => handleInputChange('buAssignment',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Horizontal Category" value={
      formData.horizontalCategory
    } onChange={
      (e) => handleInputChange('horizontalCategory',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Vertical Category" value={
      formData.verticalCategory
    } onChange={
      (e) => handleInputChange('verticalCategory',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Sub Vertical Category" value={
      formData.subVerticalCategory
    } onChange={
      (e) => handleInputChange('subVerticalCategory',
      e.target.value)
    } />
    </Grid>
    </Grid> {
      /* Preferences Section */
    } <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Preferences </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      6
    }>
    <FormControl fullWidth>
    <InputLabel>Language Preference</InputLabel>
    <Select value={
      formData.languagePreference
    } onChange={
      (e) => handleInputChange('languagePreference',
      e.target.value)
    } label="Language Preference" >
    <MenuItem value="en">English</MenuItem>
    <MenuItem value="es">Spanish</MenuItem>
    <MenuItem value="fr">French</MenuItem>
    <MenuItem value="de">German</MenuItem>
    </Select>
    </FormControl>
    </Grid>
    </Grid> {
      /* Location Details Section */
    } <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Location Details </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Country/Region" value={
      formData.country
    } onChange={
      (e) => handleInputChange('country',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Postal Code" value={
      formData.postalCode
    } onChange={
      (e) => handleInputChange('postalCode',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="City" value={
      formData.city
    } onChange={
      (e) => handleInputChange('city',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="State" value={
      formData.state
    } onChange={
      (e) => handleInputChange('state',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="District" value={
      formData.district
    } onChange={
      (e) => handleInputChange('district',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="Street" value={
      formData.street
    } onChange={
      (e) => handleInputChange('street',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      6
    }>
    <TextField fullWidth label="House Number" value={
      formData.houseNumber
    } onChange={
      (e) => handleInputChange('houseNumber',
      e.target.value)
    } />
    </Grid>
    </Grid> {
      /* Territory Management Section */
    } <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Territory Management </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Override Territory" value={
      formData.overrideTerritory
    } onChange={
      (e) => handleInputChange('overrideTerritory',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Territory" value={
      formData.territory
    } onChange={
      (e) => handleInputChange('territory',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Owner" value={
      formData.owner
    } onChange={
      (e) => handleInputChange('owner',
      e.target.value)
    } />
    </Grid>
    </Grid> {
      /* Tax Information Section */
    } <Typography variant="h6" sx={
      {
        mt: 3,
        mb: 2,
        color: theme.palette.text.secondary
      }
    }> Tax Information </Typography>
    <Grid container spacing={
      2
    }>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Tax Country/Region" value={
      formData.taxCountry
    } onChange={
      (e) => handleInputChange('taxCountry',
      e.target.value)
    } />
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <FormControl fullWidth>
    <InputLabel>Tax Number Type</InputLabel>
    <Select value={
      formData.taxNumberType
    } onChange={
      (e) => handleInputChange('taxNumberType',
      e.target.value)
    } label="Tax Number Type" >
    <MenuItem value="vat">VAT</MenuItem>
    <MenuItem value="ein">EIN</MenuItem>
    <MenuItem value="gst">GST</MenuItem>
    </Select>
    </FormControl>
    </Grid>
    <Grid item xs={
      12
    } md={
      4
    }>
    <TextField fullWidth label="Tax Number" value={
      formData.taxNumber
    } onChange={
      (e) => handleInputChange('taxNumber',
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
    <Button variant="contained" type="submit"> Save Account </Button>
    </Box>
    </form>
    </Paper>
    </Box>
    </Box> );
  } return ( <Box>
  <MUIToolbar title="Accounts" onAction={
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
  <TableCell>Account Name</TableCell>
  <TableCell>Account Type</TableCell>
  <TableCell>Industry</TableCell>
  <TableCell>Website</TableCell>
  <TableCell>Owner</TableCell>
  </TableRow>
  </TableHead>
  <TableBody> {
    accounts.length === 0 ? ( <TableRow>
    <TableCell colSpan={
      5
    } align="center" sx={
      {
        py: 4
      }
    }>
    <Typography color="textSecondary"> No accounts found. Click the Add button to create your first account. </Typography>
    </TableCell>
    </TableRow> ) : ( accounts.map((account) => ( <TableRow key={
      account.id
    }>
    <TableCell>{
      account.accountName
    }</TableCell>
    <TableCell>{
      account.accountType
    }</TableCell>
    <TableCell>{
      account.industryHorizontal
    }</TableCell>
    <TableCell>{
      account.website
    }</TableCell>
    <TableCell>{
      account.owner
    }</TableCell>
    </TableRow> )) )
  } </TableBody>
  </Table>
  </TableContainer>
  </Paper>
  </Box>
  </Box> );
};
export default MUIAccounts;
