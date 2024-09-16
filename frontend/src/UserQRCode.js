import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code'; // Utiliza react-qr-code
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import './UserQRCode.css';

const UserQRCode = () => {
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no disponible');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/${userId}`,
        {
          headers: {
            'x-access-token': token,
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
  const fechaExpiracion = new Date(user.fecha_expiracion).toLocaleDateString();
  const fechaInscripcion = new Date(
    user.fecha_inscripcion
  ).toLocaleDateString();

  return (
    <Container className="user-qr-container">
      <Box className="qr-card">
        {/* Contenedor del QR */}
        <div className="qr-background">
          {/* QR Code */}
          <div className="qr-code">
            <QRCode value={qrData} size={200} />
          </div>

          {/* Información del usuario */}
          <div className="user-info">
            <Typography variant="body2">
              Nombre: {user.nombre} {user.apellido}
            </Typography>
            <Typography variant="body2">Cédula: {user.cedula}</Typography>
            <Typography variant="body2">
              Fecha de Inscripción: {fechaInscripcion}
            </Typography>
            <Typography variant="body2">Estado: {estado}</Typography>
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default UserQRCode;
