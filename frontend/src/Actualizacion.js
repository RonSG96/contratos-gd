import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Webcam from 'react-webcam';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import logoDorian from './assets/logo-dorian.png';

const Actualizacion = () => {
  const [cedula, setCedula] = useState('');
  const [userData, setUserData] = useState(null);
  const [isContractModalOpen, setContractModalOpen] = useState(false);
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const [isPhoto2ModalOpen, setPhoto2ModalOpen] = useState(false);
  const sigCanvas = useRef({});
  const webcamRef = useRef(null);
  const [firma, setFirma] = useState(null);
  const [foto, setFoto] = useState(null);
  const [foto2, setFoto2] = useState(null);
  const [isAgreementChecked, setAgreementChecked] = useState(false);

  const buscarUsuario = async () => {
    try {
      const response = await fetch(
        `https://contratos-backend.onrender.com/api/actualizacion/${cedula}`
      );
      const data = await response.json();
      if (data.message) {
        alert('Usuario no encontrado');
      } else {
        setUserData(data);
        setFirma(data.firma_blob ? `data:image/jpeg;base64,${data.firma_blob}` : null);
        setFoto(data.foto_blob ? `data:image/jpeg;base64,${data.foto_blob}` : null);
        setFoto2(data.foto_2_blob ? `data:image/jpeg;base64,${data.foto_2_blob}` : null);
      }
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      alert('Hubo un error al buscar el usuario.');
    }
  };

  const handleSaveSignature = () => {
    const signature = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL('image/png');
    setFirma(signature);
    setSignatureModalOpen(false);
  };

  const handleCapturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    if (photo) {
      setFoto(photo);
      setPhotoModalOpen(false);
    }
  };

  const handleCapturePhoto2 = () => {
    const photo2 = webcamRef.current.getScreenshot();
    if (photo2) {
      setFoto2(photo2);
      setPhoto2ModalOpen(false);
    }
  };

  const actualizarDatos = async () => {
    if (!firma || !foto || !foto2) {
      alert('Debe proporcionar una firma, foto 1 y foto 2 antes de finalizar.');
      return;
    }

    try {
      const response = await fetch(
        `https://contratos-backend.onrender.com/api/actualizacion/${cedula}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firma, foto, foto_2: foto2 }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(
          'Datos actualizados correctamente. Gracias por ser parte de Gimnasios Dorian.'
        );
        setUserData(null);
        setFirma(null);
        setFoto(null);
        setFoto2(null);
        setCedula('');
        setAgreementChecked(false);
      } else {
        alert(result.message || 'Error al actualizar los datos.');
      }
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      alert('Hubo un problema al actualizar los datos.');
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: '20px',
        borderRadius: '10px',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <img
          src={logoDorian}
          alt="Gimnasios Dorian Logo"
          style={{ width: '200px', marginBottom: '10px' }}
        />
        <Typography variant="h4" color="primary" gutterBottom>
          ACTUALIZACIÓN DE DATOS
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: '12px' }}>
        {/* Ajuste: Botón "Buscar" debajo del input */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <TextField
            label="Ingrese su cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: { xs: '100%', sm: '300px' }, // Responsivo: 100% en pantallas pequeñas, 300px en pantallas más grandes
              mb: 2, // Espacio entre el input y el botón
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={buscarUsuario}
            sx={{
              width: { xs: '100%', sm: '150px' }, // Responsivo: 100% en pantallas pequeñas, 150px en pantallas más grandes
              height: '40px',
              padding: '6px 16px',
            }}
          >
            Buscar
          </Button>
        </Box>

        {userData && (
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Datos del Usuario
            </Typography>
            <Box
              sx={{
                border: '2px solid #F28C38',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: '#fff',
                overflow: 'hidden', // Evita que el contenido se salga del cuadro
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Nombre:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {userData.nombre} {userData.apellido}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Cédula:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {userData.cedula}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Plan:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {userData.plan_contratado || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Fecha Inscripción:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {new Date(userData.fecha_inscripcion).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Dirección:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {userData.direccion}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Teléfono:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {userData.telefono}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Correo:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {userData.correo}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box mt={2} textAlign="center">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setContractModalOpen(true)}
                sx={{ borderColor: '#F28C38', color: '#F28C38' }}
              >
                Ver Contrato
              </Button>
            </Box>

            <Box mt={3} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Firma
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {firma ? (
                  <img
                    src={firma}
                    alt="Firma"
                    style={{ width: '200px', borderRadius: '8px', marginTop: '10px' }}
                  />
                ) : (
                  <Typography color="textSecondary">No disponible</Typography>
                )}
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setSignatureModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Actualizar Firma
              </Button>
            </Box>

            <Box mt={3} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Foto 1 (Frente de Cédula)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {foto ? (
                  <img
                    src={foto}
                    alt="Foto 1"
                    style={{ width: '150px', borderRadius: '8px', marginTop: '10px' }}
                  />
                ) : (
                  <Typography color="textSecondary">No disponible</Typography>
                )}
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setPhotoModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Actualizar Foto 1
              </Button>
            </Box>

            <Box mt={3} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Foto 2 (Reverso de Cédula)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {foto2 ? (
                  <img
                    src={foto2}
                    alt="Foto 2"
                    style={{ width: '150px', borderRadius: '8px', marginTop: '10px' }}
                  />
                ) : (
                  <Typography color="textSecondary">No disponible</Typography>
                )}
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setPhoto2ModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Actualizar Foto 2
              </Button>
            </Box>

            <Box mt={3} textAlign="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAgreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Declaro haber leído y estar de acuerdo con las cláusulas del contrato y las políticas de Gimnasios Dorian.
                  </Typography>
                }
              />
            </Box>

            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={actualizarDatos}
                disabled={!isAgreementChecked || !firma || !foto || !foto2}
                sx={{ px: 4, py: 1 }}
              >
                Finalizar
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Modal para ver contrato */}
      <Dialog
        open={isContractModalOpen}
        onClose={() => setContractModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>CONTRATO GIMNASIOS DORIAN</DialogTitle>
        <DialogContent dividers sx={{ height: '500px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img src={logoDorian} alt="Logo" style={{ width: '150px' }} />
          </Box>
          <Typography variant="body2" component="div" sx={{ textAlign: 'justify', p: 2 }}>
            <b>Bienvenid@s a:</b><br /><br />
            Le agradecemos, haya escogido los productos y servicios que presta GIMNASIO DORIAN (en adelante, los "los servicios"). Los Servicios se proporcionan en el gimnasio por usted seleccionado.<br /><br />
            {/* Resto del contrato como en el código original */}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setContractModalOpen(false)} variant="contained" color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para firmar */}
      <Dialog
        open={isSignatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px' } }}
      >
        <DialogTitle>Firmar Contrato</DialogTitle>
        <DialogContent>
          <SignatureCanvas
            penColor="black"
            ref={sigCanvas}
            canvasProps={{ width: 400, height: 200, className: 'sigCanvas' }}
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => sigCanvas.current.clear()} color="error">
            Borrar
          </Button>
          <Button onClick={() => setSignatureModalOpen(false)} color="secondary">
            Cerrar
          </Button>
          <Button onClick={handleSaveSignature} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para tomar foto 1 */}
      <Dialog
        open={isPhotoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px' } }}
      >
        <DialogTitle>Tomar Foto 1 (Frente de Cédula)</DialogTitle>
        <DialogContent>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoModalOpen(false)} color="secondary">
            Cerrar
          </Button>
          <Button onClick={handleCapturePhoto} variant="contained" color="primary">
            Guardar Foto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para tomar foto 2 */}
      <Dialog
        open={isPhoto2ModalOpen}
        onClose={() => setPhoto2ModalOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px' } }}
      >
        <DialogTitle>Tomar Foto 2 (Reverso de Cédula)</DialogTitle>
        <DialogContent>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoto2ModalOpen(false)} color="secondary">
            Cerrar
          </Button>
          <Button onClick={handleCapturePhoto2} variant="contained" color="primary">
            Guardar Foto
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Actualizacion;
