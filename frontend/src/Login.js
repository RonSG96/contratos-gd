import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';
import './Login.css';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      navigate('/admin');
    } else {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="login-container">
      <div className="login-image" />
      <div className="login-form-container">
        <Box className="login-form">
          <Typography variant="h5" gutterBottom>
            Iniciar Sesión
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Usuario"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" fullWidth>
                Ingresar
              </Button>
            </Box>
          </form>
        </Box>
      </div>
    </div>
  );
};

export default Login;
