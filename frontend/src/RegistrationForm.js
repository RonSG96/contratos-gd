import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Webcam from 'react-webcam';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import './RegistrationForm.css';
import logoDorian from './assets/logo-dorian.png';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    sucursal: '',
    planContratado: '',
  });

  const [signatureDataURL, setSignatureDataURL] = useState('');
  const [photoDataURL, setPhotoDataURL] = useState('');
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const [isContractModalOpen, setContractModalOpen] = useState(false); // Estado para controlar el modal del contrato

  const sigCanvas = useRef({});
  const webcamRef = useRef(null);

  const apiUrl = process.env.REACT_APP_API_URL; // Obtener la URL base de la API desde una variable de entorno

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveSignature = () => {
    const signature = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL('image/png');
    setSignatureDataURL(signature);
    setSignatureModalOpen(false);
  };

  const handleClearSignature = () => {
    sigCanvas.current.clear();
    setSignatureDataURL('');
  };

  const handleCapturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setPhotoDataURL(photo);
    setPhotoModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signatureDataURL) {
      alert('Por favor, firme el contrato.');
      return;
    }

    const data = {
      ...formData,
      firma: signatureDataURL,
      foto: photoDataURL,
      plan_contratado: formData.planContratado,
    };

    try {
      const response = await fetch(`${apiUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('Registro completado con éxito.');
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
        setFormData({
          nombre: '',
          apellido: '',
          cedula: '',
          telefono: '',
          correo: '',
          direccion: '',
          sucursal: '',
          planContratado: '',
        });
        setSignatureDataURL('');
        setPhotoDataURL('');
      } else {
        console.error('Error:', result.message);
        alert('Hubo un problema con el registro.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Hubo un problema con el registro.');
    }
  };

  return (
    <Container component="main" className="registration-container">
      <Box className="header-box">
        <br />
      </Box>
      <Box className="form-content">
        <Paper elevation={3} className="form-paper">
          <Typography variant="h5" className="form-title">
            Formulario de Registro
          </Typography>
          <form onSubmit={handleSubmit} className="registration-form">
            <TextField
              label="Nombres Completos"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Apellidos Completos"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Cédula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Teléfonos"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Correos"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
              margin="dense"
              required
            />

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Sucursal</InputLabel>
              <Select
                name="sucursal"
                value={formData.sucursal}
                onChange={handleChange}
              >
                <MenuItem value="Parque Industrial">Parque Industrial</MenuItem>
                <MenuItem value="Gonzalez Suarez">Gonzalez Suarez</MenuItem>
                <MenuItem value="El Cebollar">El Cebollar</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Tipo de Plan</InputLabel>
              <Select
                name="planContratado"
                value={formData.planContratado}
                onChange={handleChange}
              >
                <MenuItem value="Plan Anual">Plan Anual</MenuItem>
                <MenuItem value="Plan Trimestral">Plan Trimestral</MenuItem>
                <MenuItem value="Plan Semestral">Plan Semestral</MenuItem>
                <MenuItem value="Plan Mensual">Plan Mensual</MenuItem>
              </Select>
            </FormControl>
            <Box mt={2}>
              <Button
                onClick={() => setSignatureModalOpen(true)}
                variant="outlined"
                color="primary"
              >
                Firmar
              </Button>
              {signatureDataURL && (
                <img
                  src={signatureDataURL}
                  alt="Firma"
                  style={{ width: '100%', marginTop: 10 }}
                />
              )}
            </Box>
            {signatureDataURL && (
              <Box mt={2}>
                <Button
                  onClick={() => setPhotoModalOpen(true)}
                  variant="outlined"
                  color="primary"
                >
                  Tomar Foto
                </Button>
                {photoDataURL && (
                  <img
                    src={photoDataURL}
                    alt="Foto"
                    style={{ width: '100%', marginTop: 10 }}
                  />
                )}
              </Box>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: 20 }}
            >
              Finalizar
            </Button>
          </form>
        </Paper>

        {/* Botón para ver el contrato */}
        <Button
          onClick={() => setContractModalOpen(true)}
          variant="outlined"
          color="secondary"
          style={{ marginTop: 20 }}
        >
          Ver Contrato
        </Button>

        {/* Modal para ver el contrato con scroll */}
        <Dialog
          open={isContractModalOpen}
          onClose={() => setContractModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Contrato</DialogTitle>
          <DialogContent
            dividers
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Typography variant="body2" component="div">
              {/* Aquí va todo el contenido del contrato con scroll */}
              <b>Bienvenid@s a:</b>
              <br />
              <br />
              <img
                src={logoDorian}
                alt="Gimnasio Dorian Logo"
                className="contract-logo"
              />
              <br />
              <br />
              Le agradecemos, haya escogido los productos y servicios que presta
              GIMNASIO DORIAN (en adelante "los servicios"). Los servicios se
              proporcionan en el gimnasio por usted seleccionado.
              <br />
              <br />
              El uso de nuestros servicios constituye una aceptación total de
              estas condiciones y la posibilidad de aplicar las leyes necesarias
              de ser el caso. Razón por la que recomendamos que las lea
              detenimiento y con atención y de ser posible guardarlos. Si usted
              no se encuentra de acuerdo con ellos, no debe usar nuestros
              servicios bajo ninguna excusa.
              <br />
              <br />
              {/* Aquí puedes continuar todo el texto del contrato */}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setContractModalOpen(false)}
              variant="contained"
              color="primary"
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Modal para firmar */}
      <Dialog
        open={isSignatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
      >
        <DialogTitle>Firmar Contrato</DialogTitle>
        <DialogContent>
          <SignatureCanvas
            penColor="black"
            ref={sigCanvas}
            canvasProps={{
              width: 400,
              height: 200,
              className: 'sigCanvas',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClearSignature}
            variant="outlined"
            color="secondary"
          >
            Borrar Firma
          </Button>
          <Button
            onClick={() => setSignatureModalOpen(false)}
            variant="contained"
            color="secondary"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleSaveSignature}
            variant="contained"
            color="primary"
          >
            Guardar Firma
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para tomar foto */}
      <Dialog open={isPhotoModalOpen} onClose={() => setPhotoModalOpen(false)}>
        <DialogTitle>Tomar Foto</DialogTitle>
        <DialogContent>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: 'user',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPhotoModalOpen(false)}
            variant="contained"
            color="secondary"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleCapturePhoto}
            variant="contained"
            color="primary"
          >
            Guardar Foto
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistrationForm;
