import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Divider,
} from '@mui/material';
import './Header.css';
import logoDorian from '../src/assets/logo-dorian.png';

const Header = () => {
  return (
    <AppBar position="static" className="header-appbar">
      <Container maxWidth="lg">
        <Toolbar className="header-toolbar">
          <Box display="flex" alignItems="center" className="header-content">
            <img
              src={logoDorian}
              alt="Gimnasio Dorian Logo"
              className="header-logo"
            />
            <Box display="flex" alignItems="center">
              <Divider
                orientation="vertical"
                flexItem
                className="header-divider"
              />
              <Typography variant="subtitle1" className="header-subtitle">
                CONTRATOS DE SERVICIOS
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
