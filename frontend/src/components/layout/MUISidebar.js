import React,
{
  useState
} from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Home,
  Dashboard,
  CalendarToday,
  Feed,
  People,
  Business,
  ContactPhone,
  TrendingUp,
  Person,
  Assignment,
  Inventory,
  Analytics,
  CompareArrows,
  Handshake,
  VisibilityOutlined,
  Integration,
  Settings,
  ExpandLess,
  ExpandMore,
  ChevronLeft
} from '@mui/icons-material';
import {
  useNavigate,
  useLocation
} from 'react-router-dom';
const drawerWidth = 280;
export const MUISidebar = ({
  open,
  onClose
}) => {
  ;
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedItems,
  setExpandedItems] = useState({
    customers: true,
    sales: true,
    activities: false,
    analysis: false,
    integrations: false
  });
  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };
  const menuItems = [ {
    label: 'Home',
    icon: <Home />,
    path: '/'
  },
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard'
  },
  {
    label: 'Calendar',
    icon: <CalendarToday />,
    path: '/calendar'
  },
  {
    label: 'Customers',
    icon: <People />,
    expandKey: 'customers',
    children: [ {
      label: 'Accounts',
      icon: <Business />,
      path: '/customers/accounts'
    },
    {
      label: 'Contacts',
      icon: <ContactPhone />,
      path: '/customers/contacts'
    },
    {
      label: 'Account Hierarchy',
      icon: <TrendingUp />,
      path: '/customers/hierarchy'
    } ]
  },
  {
    label: 'Sales',
    icon: <TrendingUp />,
    expandKey: 'sales',
    children: [ {
      label: 'Leads',
      icon: <Person />,
      path: '/sales/leads'
    },
    {
      label: 'Opportunities',
      icon: <Assignment />,
      path: '/sales/opportunities'
    },
    {
      label: 'Sales Quotes',
      icon: <Assignment />,
      path: '/sales/quotes'
    },
    {
      label: 'Sales Orders',
      icon: <Assignment />,
      path: '/sales/orders'
    } ]
  },
  {
    label: 'Activities',
    icon: <Assignment />,
    expandKey: 'activities',
    children: [ {
      label: 'Appointments',
      icon: <CalendarToday />,
      path: '/activities/appointments'
    },
    {
      label: 'E-Mails',
      icon: <Feed />,
      path: '/activities/emails'
    },
    {
      label: 'Tasks',
      icon: <Assignment />,
      path: '/activities/tasks'
    } ]
  },
  {
    label: 'Visits',
    icon: <VisibilityOutlined />,
    path: '/visits'
  },
  {
    label: 'Integrations',
    icon: <Integration />,
    expandKey: 'integrations',
    children: [ {
      label: 'Email Integration',
      icon: <Feed />,
      path: '/integrations/email'
    },
    {
      label: 'Google Leads Integration',
      icon: <Integration />,
      path: '/integrations/google'
    } ]
  },
  {
    label: 'Admin / Settings',
    icon: <Settings />,
    path: '/admin'
  } ];
  const renderMenuItem = (item,
  level = 0) => {
    ;
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.expandKey];
    return ( <React.Fragment key={
      item.label
    }>
    <ListItem disablePadding sx={
      {
        pl: level * 2
      }
    }>
    <ListItemButton onClick={
      hasChildren ? () => toggleExpanded(item.expandKey) : () => handleNavigation(item.path)
    } selected={
      isActive
    } sx={
      {
        borderRadius: 1,
        mx: 1,
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          '& .MuiListItemIcon-root': {
            color: 'white',
          },
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
      }
    } >
    <ListItemIcon sx={
      {
        minWidth: 40
      }
    }> {
      item.icon
    } </ListItemIcon>
    <ListItemText primary={
      item.label
    } /> {
      hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)
    } </ListItemButton>
    </ListItem> {
      hasChildren && ( <Collapse in={
        isExpanded
      } timeout="auto" unmountOnExit>
      <List component="div" disablePadding> {
        item.children.map(child => renderMenuItem(child,
        level + 1))
      } </List>
      </Collapse> )
    } </React.Fragment> );
  };
  const drawerContent = ( <>
  <div style={
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      borderBottom: `1px solid ${
        theme.palette.divider
      }`
    }
  }>
  <Typography variant="h6" color="primary" fontWeight="bold"> CRM </Typography> {
    isMobile && ( <IconButton onClick={
      onClose
    }>
    <ChevronLeft />
    </IconButton> )
  } </div>
  <List sx={
    {
      pt: 1
    }
  }> {
    menuItems.map(item => renderMenuItem(item))
  } </List>
  </> );
  return ( <Drawer variant={
    isMobile ? 'temporary' : 'persistent'
  } anchor="left" open={
    open
  } onClose={
    onClose
  } sx={
    {
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        borderRight: `1px solid ${
          theme.palette.divider
        }`,
      },
    }
  } ModalProps={
    {
      keepMounted: true,
      // Better mobile performance
    }
  } > {
    drawerContent
  } </Drawer> );
};
