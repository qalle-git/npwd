import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import { Briefcase, Contact, History, Phone } from 'lucide-react';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  icon: {
    color: theme.palette.primary.main,
  },
}));

const DialerNavBar: React.FC = () => {
  const classes = useStyles();
  const { pathname } = useLocation();
  const [page, setPage] = useState(pathname);
  const [t] = useTranslation();

  const handleChange = (_e, newPage) => {
    setPage(newPage);
  };

  return (
    <BottomNavigation value={page} onChange={handleChange} showLabels className={classes.root}>
      <BottomNavigationAction value="/phone" component={NavLink} icon={<History />} to="/phone" />
      <BottomNavigationAction
        value="/phone/dial"
        color="secondary"
        component={NavLink}
        icon={<Phone />}
        to="/phone/dial"
      />
      <BottomNavigationAction
        value="/phone/contacts"
        color="secondary"
        component={NavLink}
        icon={<Contact />}
        to="/phone/contacts"
      />
      <BottomNavigationAction
        value="/phone/services"
        color="secondary"
        component={NavLink}
        icon={<Briefcase />}
        to="/phone/services"
      />
    </BottomNavigation>
  );
};

export default DialerNavBar;
