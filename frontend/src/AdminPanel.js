import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import './AdminPanel.css';

const AdminPanel = ({ setToken }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`${apiUrl}/users`);
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, [apiUrl]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(search.toLowerCase()) ||
      user.apellido.toLowerCase().includes(search.toLowerCase()) ||
      user.cedula.includes(search)
  );

  const handleDownload = async (cedula) => {
    try {
      const response = await fetch(`${apiUrl}/download/${cedula}`);
      if (!response.ok) {
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
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, estado: newEstado } : u
        )
      );
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${apiUrl}/user/${id}`, {
        method: 'DELETE',
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditUser({
      ...user,
      fecha_inscripcion: new Date(user.fecha_inscripcion)
        .toISOString()
        .split('T')[0], // Convert to YYYY-MM-DD format
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditUser(null);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/user/${editUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editUser),
        }
      );
      const result = await response.json();
      if (result.status === 'success') {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editUser.id ? { ...user, ...editUser } : user
          )
        );
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
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
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
                      onClick={() => handleDownload(user.cedula)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleToggleEstado(user)}
                    >
                      {user.estado === 'activo' ? (
                        <ToggleOnIcon />
                      ) : (
                        <ToggleOffIcon />
                      )}
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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
            >
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
