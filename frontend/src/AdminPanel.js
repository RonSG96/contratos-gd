import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TablePagination,
  Box,
  IconButton,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  CircularProgress, // Added for loading indicator
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  ExitToApp as LogoutIcon,
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material';
import { toPng } from 'html-to-image';
import debounce from 'lodash/debounce'; // Added for search debouncing
import './AdminPanel.css';

// Optimize table row rendering with React.memo
const UserRow = React.memo(({ user, onDownloadPDF, onToggleEstado, onEditUser, onDeleteUser, onDownloadQR, onAllowEdit }) => (
  <TableRow key={user.id}>
    <TableCell>{user.nombre}</TableCell>
    <TableCell>{user.apellido}</TableCell>
    <TableCell>{user.cedula}</TableCell>
    <TableCell>
      {new Date(user.fecha_inscripcion).toLocaleDateString()}
    </TableCell>
    <TableCell>
      {new Date(user.fecha_expiracion).toLocaleDateString()}
    </TableCell>
    <TableCell>{user.sucursal}</TableCell>
    <TableCell>{user.plan_contratado}</TableCell>
    <TableCell>{user.estado}</TableCell>
    <TableCell>
      <IconButton
        color="primary"
        onClick={() => onDownloadPDF(user.cedula)}
      >
        <DownloadIcon />
      </IconButton>
      <IconButton
        color="primary"
        onClick={() => onToggleEstado(user)}
      >
        {user.estado === 'activo' ? (
          <ToggleOnIcon />
        ) : (
          <ToggleOffIcon />
        )}
      </IconButton>
      <IconButton
        color="primary"
        onClick={() => onEditUser(user)}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        color="primary"
        onClick={() => onDeleteUser(user.id)}
      >
        <DeleteIcon />
      </IconButton>
      <IconButton
        color="primary"
        onClick={() => onDownloadQR(user.id)}
      >
        <QrCodeIcon />
      </IconButton>
      <IconButton
        color="secondary"
        onClick={() => onAllowEdit(user.cedula)}
      >
        <EditIcon />
      </IconButton>
    </TableCell>
  </TableRow>
));

const AdminPanel = ({ setToken }) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // Added for server-side pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Added for loading indicator
  const apiUrl = process.env.REACT_APP_API_URL;
  const qrRef = React.createRef(); // Para capturar el QR

  // Updated fetchUsers to support server-side pagination, filtering, and sorting
  const fetchUsers = useCallback(async (currentPage, currentRowsPerPage, searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/users?page=${currentPage + 1}&limit=${currentRowsPerPage}&search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      alert('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Debounce the fetchUsers call for search
  const debouncedFetchUsers = useCallback(
    debounce((page, rowsPerPage, search) => {
      fetchUsers(page, rowsPerPage, search);
    }, 500),
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers(page, rowsPerPage, search);
  }, [page, rowsPerPage, fetchUsers]);

  useEffect(() => {
    debouncedFetchUsers(page, rowsPerPage, search);
  }, [search, debouncedFetchUsers, page, rowsPerPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleAllowEdit = async (cedula) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token enviado:', token);
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }

      const response = await fetch(
        `https://contratos-backend.onrender.com/api/admin/allow-edit/${cedula}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert('Edición habilitada para el usuario');
        fetchUsers(page, rowsPerPage, search); // Refresh the user list
      } else {
        console.log('Error en la respuesta:', result);
        alert(result.message || 'Error al habilitar edición');
      }
    } catch (error) {
      console.error('Error al habilitar edición:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDownloadQR = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/${id}/download-qr`
      );
      if (!response.ok) {
        console.error('Estado de la respuesta:', response.status);
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_${id}_qr.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert('Se ha descargado el QR.');
    } catch (error) {
      console.error('Error al descargar el QR:', error);
    }
  };

  const handleDownloadPDF = async (cedula) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/download/${cedula}`
      );
      if (!response.ok) {
        console.error('Estado de la respuesta:', response.status);
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cedula}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert('Se ha descargado el documento.');
    } catch (error) {
      console.error('Error al descargar el documento:', error);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleToggleEstado = async (user) => {
    try {
      const newEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
      await fetch(`${apiUrl}/user/estado/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newEstado }),
      });
      fetchUsers(page, rowsPerPage, search); // Refresh the user list
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${apiUrl}/user/${id}`, {
        method: 'DELETE',
      });
      fetchUsers(page, rowsPerPage, search); // Refresh the user list
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditUser({
      ...user,
      fecha_inscripcion: new Date(user.fecha_inscripcion)
        .toISOString()
        .split('T')[0],
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditUser(null);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUser),
      });
      const result = await response.json();
      if (result.status === 'success') {
        fetchUsers(page, rowsPerPage, search); // Refresh the user list
        handleEditDialogClose();
      } else {
        console.error('Error al actualizar el usuario:', result.message);
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <Container className="admin-panel-container">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
      <TextField
        label="Buscar por nombre, apellido o cédula"
        variant="outlined"
        fullWidth
        value={search}
        onChange={handleSearchChange}
        margin="normal"
      />
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Cédula</TableCell>
                  <TableCell>Fecha de Inscripción</TableCell>
                  <TableCell>Fecha de Expiración</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Plan Contratado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDownloadPDF={handleDownloadPDF}
                    onToggleEstado={handleToggleEstado}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    onDownloadQR={handleDownloadQR}
                    onAllowEdit={handleAllowEdit}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers} // Updated to use totalUsers from server
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombres Completos"
            name="nombre"
            value={editUser?.nombre || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Apellidos Completos"
            name="apellido"
            value={editUser?.apellido || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Cédula"
            name="cedula"
            value={editUser?.cedula || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Teléfonos"
            name="telefono"
            value={editUser?.telefono || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Correos"
            name="correo"
            value={editUser?.correo || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Dirección"
            name="direccion"
            value={editUser?.direccion || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Sucursal</InputLabel>
            <Select
              name="sucursal"
              value={editUser?.sucursal || ''}
              onChange={handleEditChange}
            >
              <MenuItem value="Parque Industrial">Parque Industrial</MenuItem>
              <MenuItem value="Gonzalez Suarez">Gonzalez Suarez</MenuItem>
              <MenuItem value="El Cebollar">El Cebollar</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Tipo de Plan</InputLabel>
            <Select
              name="plan_contratado"
              value={editUser?.plan_contratado || ''}
              onChange={handleEditChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              <MenuItem value="Plan Anual">Plan Anual</MenuItem>
              <MenuItem value="Plan Trimestral">Plan Trimestral</MenuItem>
              <MenuItem value="Plan Semestral">Plan Semestral</MenuItem>
              <MenuItem value="Plan Mensual">Plan Mensual</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Fecha de Inscripción"
            type="date"
            name="fecha_inscripcion"
            value={editUser?.fecha_inscripcion || ''}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
