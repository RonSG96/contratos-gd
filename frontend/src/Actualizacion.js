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
  const [isPhoto2ModalOpen, setPhoto2ModalOpen] = useState(false); // Modal para la segunda foto
  const sigCanvas = useRef({});
  const webcamRef = useRef(null);
  const webcamRef2 = useRef(null); // Referencia para la segunda cámara
  const [firma, setFirma] = useState(null);
  const [foto, setFoto] = useState(null);
  const [foto2, setFoto2] = useState(null); // Estado para la segunda foto
  const [isAgreementChecked, setAgreementChecked] = useState(false);

  // Buscar usuario por cédula
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
        setFirma(
          data.firma_blob ? `data:image/jpeg;base64,${data.firma_blob}` : null
        );
        setFoto(
          data.foto_blob ? `data:image/jpeg;base64,${data.foto_blob}` : null
        );
        setFoto2(
          data.foto_2_blob ? `data:image/jpeg;base64,${data.foto_2_blob}` : null
        ); // Cargar foto_2
      }
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      alert('Hubo un error al buscar el usuario.');
    }
  };

  // Guardar firma en formato imagen
  const handleSaveSignature = () => {
    const signature = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL('image/png');
    setFirma(signature);
    setSignatureModalOpen(false);
  };

  // Capturar foto 1 desde la cámara
  const handleCapturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setFoto(photo);
    setPhotoModalOpen(false);
  };

  // Capturar foto 2 desde la cámara
  const handleCapturePhoto2 = () => {
    const photo2 = webcamRef2.current.getScreenshot();
    setFoto2(photo2);
    setPhoto2ModalOpen(false);
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
          body: JSON.stringify({ firma, foto, foto_2: foto2 }), // Enviar foto_2
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
      {/* Header con Logo */}
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

      {/* Buscar Usuario */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: '12px' }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <TextField
            label="Ingrese su cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={buscarUsuario}
            sx={{ height: '40px' }}
          >
            Buscar
          </Button>
        </Box>

        {userData && (
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Datos del Usuario
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <b>Nombre:</b> {userData.nombre} {userData.apellido}
                </Typography>
                <Typography>
                  <b>Cédula:</b> {userData.cedula}
                </Typography>
                <Typography>
                  <b>Plan:</b> {userData.plan_contratado || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <b>Fecha Inscripción:</b>{' '}
                  {new Date(userData.fecha_inscripcion).toLocaleDateString()}
                </Typography>
                <Typography>
                  <b>Dirección:</b> {userData.direccion}
                </Typography>
                <Typography>
                  <b>Teléfono:</b> {userData.telefono}
                </Typography>
                <Typography>
                  <b>Correo:</b> {userData.correo}
                </Typography>
              </Grid>
            </Grid>

            {/* Botón Ver Contrato */}
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setContractModalOpen(true)}
                sx={{ mr: 1 }}
              >
                Ver Contrato
              </Button>
            </Box>

            {/* Firma */}
            <Box mt={3} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Firma
              </Typography>
              {firma ? (
                <img
                  src={firma}
                  alt="Firma"
                  style={{
                    width: '200px',
                    borderRadius: '8px',
                    marginTop: '10px',
                  }}
                />
              ) : (
                <Typography color="textSecondary">No disponible</Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setSignatureModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Actualizar Firma
              </Button>
            </Box>

            {/* Foto 1 */}
            <Box mt={3} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Foto 1 (Frente de Cédula)
              </Typography>
              {foto ? (
                <img
                  src={foto}
                  alt="Foto 1"
                  style={{
                    width: '150px',
                    borderRadius: '8px',
                    marginTop: '10px',
                  }}
                />
              ) : (
                <Typography color="textSecondary">No disponible</Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setPhotoModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Actualizar Foto 1
              </Button>
            </Box>

            {/* Foto 2 */}
            <Box mt={3} textAlign="center">
              <Typography variant="h6" color="textSecondary">
                Foto 2 (Reverso de Cédula)
              </Typography>
              {foto2 ? (
                <img
                  src={foto2}
                  alt="Foto 2"
                  style={{
                    width: '150px',
                    borderRadius: '8px',
                    marginTop: '10px',
                  }}
                />
              ) : (
                <Typography color="textSecondary">No disponible</Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setPhoto2ModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Actualizar Foto 2
              </Button>
            </Box>

            {/* Aceptar Cláusulas */}
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
                    Declaro haber leído y estar de acuerdo con las cláusulas del
                    contrato y las políticas de Gimnasios Dorian.
                  </Typography>
                }
              />
            </Box>

            {/* Botón Finalizar */}
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
        <DialogTitle sx={{ textAlign: 'center' }}>
          CONTRATO GIMNASIOS DORIAN
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            height: '500px',
            overflowY: 'auto',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img src={logoDorian} alt="Logo" style={{ width: '150px' }} />
          </Box>
          <Typography
            variant="body2"
            component="div"
            sx={{ textAlign: 'justify', p: 2 }}
          >
            <b>Bienvenid@s a:</b>
            <br />
            <br />
            Le agradecemos, haya escogido los productos y servicios que presta
            GIMNASIO DORIAN (en adelante, los "los servicios"). Los Servicios se
            proporcionan en el gimnasio por usted seleccionado.
            <br />
            <br />
            El uso de nuestros servicios constituye una aceptación total de
            estas condiciones y la posibilidad de aplicar las leyes necesarias
            de ser el caso. Razón por la que recomendamos que las lea
            detenidamente con atención, y de ser posible guardarlas, si usted no
            se encuentra de acuerdo con aquello, no debe usar nuestros servicios
            bajo ninguna excusa.
            <br />
            <br />
            GIMNASIOS DORIAN se reserva el derecho de modificar, o enmendar este
            acuerdo, previa notificación por cualquier medio al cliente. Por
            favor, revisarla para poder mantenerse actualizado respecto a
            cualquier potencial cambio. Esta autorización se entiende hecha con
            carácter gratuito.
            <br />
            <br />
            <b>1. Normas de Funcionamiento:</b>
            <br />
            <br />
            <b>1.1.</b> Está prohibido fumar dentro de las instalaciones.
            <br />
            <b>1.2.</b> El consumo del alcohol o sustancias sujetas a
            fiscalización...
            <br />
            {/* Continúa con el resto del contrato como en el código original */}
            <b>5. Política de Congelamiento de Planes</b>
            <br />
            Los planes no serán sujetos a devoluciones o extensiones, y tendrán
            validez durante el tiempo y por el monto acordado.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setContractModalOpen(false)}
            variant="contained"
            color="secondary"
          >
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
          <Button
            onClick={() => setSignatureModalOpen(false)}
            color="secondary"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleSaveSignature}
            variant="contained"
            color="primary"
          >
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
          <Button
            onClick={handleCapturePhoto}
            variant="contained"
            color="primary"
          >
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
            ref={webcamRef2}
            screenshotFormat="image/jpeg"
            width="100%"
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoto2ModalOpen(false)} color="secondary">
            Cerrar
          </Button>
          <Button
            onClick={handleCapturePhoto2}
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

export default Actualizacion;
