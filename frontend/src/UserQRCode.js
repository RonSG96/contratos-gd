import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import './UserQRCode.css';

const UserQRCode = () => {
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5500/user/${userId}`, {
        headers: {
          'x-access-token': token,
        },
      });
      const data = await response.json();
      setUser(data);
    };
    fetchUser();
  }, [userId]);

  if (!user) {
    return <Typography>Cargando...</Typography>;
  }

  const qrData = `http://localhost:5500/user/${userId}/qr`;
  const estado = user.estado === 'activo' ? 'aprobado' : 'caducado';
  const imageUrl = `http://localhost:5500/assets/${estado}.png`;
  const fechaExpiracion = new Date(user.fecha_expiracion).toLocaleDateString();

  return (
    <Container className="user-qr-container">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" gutterBottom>
          Código QR
        </Typography>
        <Paper elevation={3} className="qr-paper">
          <QRCode value={qrData} size={256} />
        </Paper>
        <Box mt={2}>
          <img src={imageUrl} alt={estado} className="estado-image" />
        </Box>
        <Box mt={2}>
          <Typography variant="body1">
            Nombre: {user.nombre} {user.apellido}
          </Typography>
          <Typography variant="body1">Cédula: {user.cedula}</Typography>
          <Typography variant="body1">Estado: {estado}</Typography>
          <Typography variant="body1">
            Su suscripción vence: {fechaExpiracion}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default UserQRCode;
