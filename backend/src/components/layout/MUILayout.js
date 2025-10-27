import React,
{
  useState
} from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu
} from '@mui/icons-material';
import {
  MUISidebar
} from './MUISidebar';
export const MUILayout = ({
  children
}) => {
  ;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen,
  setSidebarOpen] = useState(!isMobile);
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return ( <Box sx={
    {
      display: 'flex',
      minHeight: '100vh'
    }
  }> {
    /* Mobile App Bar */
  } {
    isMobile && ( <AppBar position="fixed" sx={
      {
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main
      }
    } >
    <Toolbar>
    <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={
      handleDrawerToggle
    } sx={
      {
        mr: 2
      }
    } >
    <Menu />
    </IconButton>
    <Typography variant="h6" noWrap component="div"> CRM </Typography>
    </Toolbar>
    </AppBar> );
  } {
    /* Sidebar */
  } <MUISidebar open={
    sidebarOpen
  } onClose={
    () => setSidebarOpen(false)
  } /> {
    /* Main content */
  } <Box component="main" sx={
    {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      marginTop: isMobile ? '64px' : 0,
      marginLeft: !isMobile && sidebarOpen ? 0 : 0,
    }
  } > {
    children
  } </Box>
  </Box> );
};
