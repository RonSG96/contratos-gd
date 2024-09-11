import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code'; // Actualizado a react-qr-code
import { Container, Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import './UserQRCode.css';

const UserQRCode = () => {
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token'); // Obtener el token desde localStorage
      if (!token) {
        console.error('Token no disponible');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/${userId}`,
        {
          headers: {
            'x-access-token': token, // Enviar el token en las cabeceras
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        console.error('Error al obtener el usuario:', data.message);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  const qrData = `${process.env.REACT_APP_API_URL}/user/${userId}/qr`;
  const estado = user.estado === 'activo' ? 'aprobado' : 'caducado';
  const imageUrl = `${process.env.REACT_APP_API_URL}/assets/${estado}.png`;
  const fechaExpiracion = new Date(user.fecha_expiracion).toLocaleDateString();

  return (
    <Container className="user-qr-container">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" gutterBottom>
          Código QR
        </Typography>
        <Paper elevation={3} className="qr-paper">
          {/* Asegúrate de que QRCode esté recibiendo el valor */}
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
