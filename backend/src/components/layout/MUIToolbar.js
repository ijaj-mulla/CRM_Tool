import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Box,
  useTheme
} from '@mui/material';
import {
  Search,
  SwapVert,
  PieChartOutline,
  FilterAlt,
  AddCircleOutline,
  Refresh,
  MoreHoriz
} from '@mui/icons-material';
export const MUIToolbar = ({
  title,
  onAction
}) => {
  ;
  const theme = useTheme();
  const toolbarActions = [ {
    icon: <Search />,
    label: 'Search',
    action: 'search'
  },
  {
    icon: <SwapVert />,
    label: 'Sort',
    action: 'sort'
  },
  {
    icon: <PieChartOutline />,
    label: 'Chart/Stats',
    action: 'chart'
  },
  {
    icon: <FilterAlt />,
    label: 'Filter',
    action: 'filter'
  },
  {
    icon: <AddCircleOutline />,
    label: 'Add New',
    action: 'add'
  },
  {
    icon: <Refresh />,
    label: 'Refresh',
    action: 'refresh'
  },
  {
    icon: <MoreHoriz />,
    label: 'More Options',
    action: 'more'
  } ];
  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
  };
  return ( <AppBar position="static" color="inherit" elevation={
    1
  } sx={
    {
      backgroundColor: 'white',
      borderBottom: `1px solid ${
        theme.palette.divider
      }`
    }
  } >
  <Toolbar> {
    title && ( <Typography variant="h6" component="h1" sx={
      {
        flexGrow: 1,
        color: theme.palette.text.primary,
        fontWeight: 600
      }
    } > {
      title
    } </Typography> );
  } <Box sx={
    {
      display: 'flex',
      gap: 0.5
    }
  }> {
    toolbarActions.map((action) => ( <Tooltip key={
      action.action
    } title={
      action.label
    }>
    <IconButton onClick={
      () => handleAction(action.action)
    } sx={
      {
        color: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        },
      }
    } > {
      action.icon
    } </IconButton>
    </Tooltip> ))
  } </Box>
  </Toolbar>
  </AppBar> );
};
