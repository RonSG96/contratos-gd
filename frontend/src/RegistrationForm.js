import React, { useState, useRef, useCallback } from 'react';
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
  Checkbox,
  FormControlLabel,
  IconButton, // Correctamente importado
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  SwitchCamera as SwitchCameraIcon,
} from '@mui/icons-material';
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
    planContratado: null,
  });

  const [signatureDataURL, setSignatureDataURL] = useState('');
  const [photoDataURL, setPhotoDataURL] = useState('');
  const [photo2DataURL, setPhoto2DataURL] = useState('');
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const [isPhoto2ModalOpen, setPhoto2ModalOpen] = useState(false);
  const [isContractModalOpen, setContractModalOpen] = useState(false);
  const [isAgreeChecked, setAgreeChecked] = useState(false);
  const [isSignatureDone, setSignatureDone] = useState(false);
  const [isPhotoTaken, setPhotoTaken] = useState(false);
  const [isPhoto2Taken, setPhoto2Taken] = useState(false);
  const [isFinalButtonDisabled, setFinalButtonDisabled] = useState(true);
  const [isSignButtonEnabled, setSignButtonEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // Cámara trasera por defecto

  const sigCanvas = useRef({});
  const webcamRef = useRef(null); // Usaremos una sola referencia para ambas cámaras

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === 'cedula'
        ? value.replace(/[^0-9]/g, '').trim()
        : value.replace(/^\s+/, '');
    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });
  };

  const handleSaveSignature = () => {
    const signature = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL('image/png');
    setSignatureDataURL(signature);
    setSignatureModalOpen(false);
    setSignatureDone(true);
    checkIfCanEnableAgree();
  };

  const handleClearSignature = () => {
    sigCanvas.current.clear();
    setSignatureDataURL('');
    setSignatureDone(false);
    checkIfCanEnableAgree();
  };

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const handleCapturePhoto = () => {
    if (!webcamRef.current) {
      console.error('Webcam no está inicializada');
      return;
    }

    const photo = webcamRef.current.getScreenshot();
    if (!photo) {
      console.error('No se pudo capturar la foto');
      return;
    }

    // Quitamos la rotación automática para evitar que la imagen gire innecesariamente
    setPhotoDataURL(photo);
    setPhotoModalOpen(false);
    setPhotoTaken(true);
    checkIfCanEnableAgree();
  };

  const handleCapturePhoto2 = () => {
    if (!webcamRef.current) {
      console.error('Webcam no está inicializada');
      return;
    }

    const photo2 = webcamRef.current.getScreenshot();
    if (!photo2) {
      console.error('No se pudo capturar la foto 2');
      return;
    }

    // Quitamos la rotación automática para evitar que la imagen gire innecesariamente
    setPhoto2DataURL(photo2);
    setPhoto2ModalOpen(false);
    setPhoto2Taken(true);
    checkIfCanEnableAgree();
  };

  const checkIfCanEnableAgree = () => {
    if (signatureDataURL && photoDataURL && photo2DataURL) {
      setAgreeChecked(false);
    }
  };

  const handleAgreeChange = (e) => {
    setAgreeChecked(e.target.checked);
    if (e.target.checked) {
      setFinalButtonDisabled(false);
    } else {
      setFinalButtonDisabled(true);
    }
  };

  const handleContractModalClose = () => {
    setContractModalOpen(false);
    setSignButtonEnabled(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signatureDataURL) {
      alert('Por favor, firme el contrato.');
      return;
    }
    if (!photoDataURL) {
      alert('Por favor, tome la foto de la cédula frontal.');
      return;
    }
    if (!photo2DataURL) {
      alert('Por favor, tome la foto de la cédula posterior.');
      return;
    }

    const data = {
      ...formData,
      firma: signatureDataURL,
      foto: photoDataURL,
      foto_2: photo2DataURL,
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

      console.log('Respuesta del backend:', result);

      if (response.ok && result.status === 'success') {
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
        setPhoto2DataURL('');
        setAgreeChecked(false);
        setFinalButtonDisabled(true);
        setSignButtonEnabled(false);
        setSignatureDone(false);
        setPhotoTaken(false);
        setPhoto2Taken(false);
      } else {
      // Mostrar el mensaje específico devuelto por el servidor
      alert(result.message || 'Hubo un problema con el registro: Notificar en counter');
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('Error de conexión con el servidor. Por favor, intenta de nuevo.');
  }
};

  return (
    <Container component="main" className="registration-container">
      <Box className="form-content">
        <Paper elevation={3} className="form-paper">
          <Typography variant="h5" className="form-title">
            FORMULARIO DE REGISTRO
            <br />
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
              <InputLabel shrink={false}>Sucursal</InputLabel>
              <Select
                name="sucursal"
                value={formData.sucursal}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Seleccione una sucursal
                </MenuItem>
                <MenuItem value="Parque Industrial">Parque Industrial</MenuItem>
                <MenuItem value="Gonzalez Suarez">Gonzalez Suarez</MenuItem>
                <MenuItem value="El Cebollar">El Cebollar</MenuItem>
              </Select>
            </FormControl>

            <Box mt={2}>
              <Button
                onClick={() => setContractModalOpen(true)}
                variant="outlined"
                color="primary"
              >
                Ver Contrato
              </Button>
            </Box>

            <Box mt={2}>
              <Button
                onClick={() => setSignatureModalOpen(true)}
                variant="outlined"
                color="primary"
                disabled={!isSignButtonEnabled}
              >
                Firmar
              </Button>
              {signatureDataURL && (
                <img
                  src={signatureDataURL}
                  alt="Firma"
                  style={{ width: '50%', marginTop: 10 }}
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
                  Cédula frontal
                </Button>
                {photoDataURL && (
                  <img
                    src={photoDataURL}
                    alt="Cédula frontal"
                    style={{ width: '100%', marginTop: 10 }}
                  />
                )}
              </Box>
            )}
            {photoDataURL && (
              <Box mt={2}>
                <Button
                  onClick={() => setPhoto2ModalOpen(true)}
                  variant="outlined"
                  color="primary"
                >
                  Cédula posterior
                </Button>
                {photo2DataURL && (
                  <img
                    kısa
                    src={photo2DataURL}
                    alt="Cédula Posterior 2"
                    style={{ width: '100%', marginTop: 10 }}
                  />
                )}
              </Box>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={isAgreeChecked}
                  onChange={handleAgreeChange}
                  disabled={
                    !signatureDataURL || !photoDataURL || !photo2DataURL
                  }
                />
              }
              label="Declaro haber leído y estar de acuerdo con las cláusulas del contrato y las políticas de Gimnasios Dorian."
              style={{ marginTop: 20 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: 20 }}
              disabled={isFinalButtonDisabled}
            >
              Finalizar
            </Button>
          </form>
        </Paper>
      </Box>

      {/* Modal para ver el contrato */}
      <Dialog
        open={isContractModalOpen}
        onClose={() => setContractModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>CONTRATO GIMNASIOS DORIAN</DialogTitle>
        <DialogContent dividers style={{ height: '400px', overflowY: 'auto' }}>
          <Typography variant="body2" component="div">
            <div style={{ textAlign: 'center' }}>
              <img
                src={logoDorian}
                alt="Gimnasio Dorian Logo"
                className="contract-logo"
              />
            </div>
            <div style={{ textAlign: 'justify' }}>
              <b>Bienvenid@s a:</b>
              <br />
              <br />
              Le agradecemos, haya escogido los productos y servicios que presta
              GIMNASIO DORIAN (en adelante, los "los servicios"). Los Servicios
              se proporcionan en el gimnasio por usted seleccionado.
              <br />
              El uso de nuestros servicios constituye una aceptación total de
              estas condiciones y la posibilidad de aplicar las leyes necesarias
              de ser el caso. Razón por la que recomendamos que las lea
              detenidamente con atención, y de ser posible guardarlas, si usted
              no se encuentra de acuerdo con aquello, no debe usar nuestros
              servicios bajo ninguna excusa.
              <br />
              GIMNASIOS DORIAN se reserva el derecho de modificar, o enmendar
              este acuerdo, previa notificación por cualquier medio al cliente.
              Por favor, revisarla para poder mantenerse actualizado respecto a
              cualquier potencial cambio. Esta autorización se entiende hecha
              con carácter gratuito.
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
              <b>1.3.</b> No se permite el consumo de alimentos dentro de las
              instalaciones, salvo en las zonas expresamente habilitadas para
              ello.
              <br />
              <b>1.4.</b> Está prohibida la entrada de animales a las
              instalaciones.
              <br />
              <b>1.5.</b> Se deberá usar ropa y calzados adecuados para las
              actividades y servicios prestados.
              <br />
              <b>1.6.</b> Se habrá de dejar los equipos y las instalaciones en
              las condiciones que se las encontró previo al uso, es decir, sin
              sudor, sin residuos de ningún tipo libres disponibles para el
              resto de usuarios.
              <br />
              <b>1.7.</b> Se deberá hacer uso correcto del equipamiento e
              implementos del gimnasio. siendo responsable el usuario de
              cualquier deterioro que se causase por uso indebido.
              <br />
              <b>1.8.</b> La sustracción y/o destrucción o daño material de
              cualquier equipo o implemento de la instalación, significará la
              expulsión automática de las instalaciones, sin perjuicio de las
              acciones civiles y penales que puedan derivar.
              <br />
              <b>1.9.</b> Debe respetarse la higiene de las instalaciones,
              haciendo el uso debido de papeleras de reciclaje para depositar
              los desperdicios de cualquier tipo.
              <br />
              <b>1.10.</b> Se respetarán los horarios establecidos para las
              actividades en las instalaciones.
              <br />
              <b>1.11.</b> Se pagará de forma puntual y sin retraso la
              mensualidad requerida.
              <br />
              <b>1.12.</b> El hecho de permitir pagar fuera de fecha, no implica
              bajo ninguna circunstancia renuncia a la cantidad debida.
              <br />
              <b>1.13.</b> El acceso y uso de las instalaciones está reservado
              únicamente a los usuarios que tengan la calidad de miembro. La
              participación en la introducción no autorizada de personas ajenas,
              no se encuentra permitida.
              <br />
              <b>1.14.</b> Las instalaciones están equipadas con sistemas de
              vigilancia y seguridad con grabación de imagen, al acceder al
              presente acuerdo, usted acepta ser grabado.
              <br />
              <b>1.15.</b> El personal se encargará de velar por el cumplimiento
              de las normas de conducta y de uso de las instalaciones.
              <br />
              <b>1.16.</b> Gimnasio Dorian se reserva limitar o impedir el
              acceso a las instalaciones cuando las circunstancias y/o la
              seguridad de las personas así lo ameriten.
              <br />
              <b>1.17.</b> Los implementos y accesorios, deben permanecer en las
              instalaciones, debiendo dejarse tras su uso en el sitio correcto y
              en orden.
              <br />
              <b>1.18.</b> Las recomendaciones o solicitudes que presenten los
              clientes deberán ser dirigidas de manera escrita a la
              administración a que puedan ser canalizadas de la mejor manera.
              <br />
              <br />
              <b>2. Vestuarios y Casilleros</b>
              <br />
              <br />
              <b>2.1.</b> DORIAN GIMNASIO no se responsabiliza de pérdidas,
              daños materiales, sustracción de dinero o de otros artículos de
              valor que se deje en los casilleros.
              <br />
              <b>2.2.</b> No está permitido afeitarse en las duchas por motivos
              de higiene, sanitarios y de seguridad.
              <br />
              <b>2.3.</b> Se ruega dejar los vestidores de la misma manera en
              que fueron encontrados.
              <br />
              <br />
              <b>3. Responsabilidad</b>
              <br />
              <br />
              <b>3.1.</b> GIMNASIO DORIAN no será responsable de los problemas
              de salud que pueda sufrir a consecuencia del "mal" uso de nuestras
              instalaciones o de nuestros programas de ejercicios. Por lo tanto,
              recomendamos que consulte con un médico antes de contratar
              nuestros servicios en caso de que tenga la tensión alta, angina de
              pecho, cardiopatía, diabetes, enfermedad crónica, desmayos y, en
              general, si concurre cualquier otra circunstancia que afecte a tu
              salud y forma física. Con la suscripción del presente contrato,
              usted declara que está en buenas condiciones para la realización
              de ejercicio físico.
              <br />
              <b>3.2.</b> Adicionalmente, GIMNASIO DORIAN no se hará responsable
              en caso de lesión debido a:
              <br />
              <b>A.</b> No prestar atención indicaciones del entrenador.
              <br />
              <b>B.</b> No realizar la debida preparación corporal para realizar
              la rutina de entrenamiento, es decir, calentamiento.
              <br />
              <b>C.</b> Afecciones cutáneas debido al no uso de la toalla.
              <br />
              <b>D.</b> Utilizar ropa indebida para realizar ejercicio.
              <br />
              <b>E.</b> Mal uso de las máquinas y demás implementos del
              Gimnasio.
              <br />
              <b>F.</b> Ejecución de los ejercicios sin realizar la técnica
              correctamente.
              <br />
              <b>G.</b> No haber hecho uso del instructor.
              <br />
              <b>H.</b> Por no comunicar lesiones o circunstancias de salud
              anteriores.
              <br />
              <b>I.</b> Por no utilizar implementos de seguridad durante el
              entrenamiento, como: cinturón, guantes, vendas, agarraderas, entre
              otros.
              <br />
              <b>J.</b> Accidentes ocasionados por terceros, sin perjuicio de la
              posibilidad de exigirle al causante del daño, la reparación
              debida.
              <br />
              <b>K.</b> Irrespeto a los protocolos de las clases grupales.
              <br />
              <b>L.</b> Ingresar en estado etílico o bajo el efecto sustancias
              estupefacientes.
              <br />
              <b>M.</b> Por no haber informado de padecer algún desorden
              alimenticio o cualquier otra enfermedad.
              <br />
              <b>N.</b> Por no alimentarse de una manera correcta antes, durante
              y después de realizar los ejercicios.
              <br />
              <br />
              <br />
              <b>4. Incumplimiento</b>
              <br />
              <br />
              <b>4.1.</b> En caso de incumplimiento, GIMNASIO DORIAN se reserva
              la posibilidad de expulsar a dicho usuario...
              <br />
              <br />
              <b>5. Política de Congelamiento de Planes</b>
              <br />
              Los planes no serán sujetos a devoluciones o extensiones...
              <br />
            </div>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleContractModalClose}
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
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px' } }} // Estilo consistente
      >
        <DialogTitle>Firmar Contrato</DialogTitle>
        <DialogContent>
          <SignatureCanvas
            penColor="black"
            ref={sigCanvas}
            canvasProps={{
              width: 300,
              height: 150,
              className: 'sigCanvas',
              style: {
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#fff',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <IconButton
            onClick={handleClearSignature} // Cambiado a la función existente
            sx={{ backgroundColor: '#ffeb3b', '&:hover': { backgroundColor: '#fdd835' } }}
          >
            <DeleteIcon sx={{ color: '#000' }} />
          </IconButton>
          <IconButton
            onClick={() => setSignatureModalOpen(false)}
            sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
          >
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
          <IconButton
            onClick={handleSaveSignature}
            sx={{ backgroundColor: '#f28c38', '&:hover': { backgroundColor: '#e07b30' } }}
          >
            <SaveIcon sx={{ color: '#fff' }} />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* Modal para tomar foto 1 */}
      {/* Modal para tomar foto 1 */}
      <Dialog
        open={isPhotoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', maxHeight: '70vh', width: '90%', maxWidth: '400px' } }} // Reducir altura y ajustar ancho del modal
      >
        <DialogTitle>Cédula Frontal</DialogTitle>
        <DialogContent sx={{ padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}> {/* Evitar scroll interno */}
          <Box sx={{ flex: '0 1 auto', maxHeight: '200px', overflow: 'hidden' }}> {/* Limitar altura del contenedor del Webcam */}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ width: 1280, height: 720, facingMode }}
              style={{ borderRadius: '8px', width: '100%', height: '200px', objectFit: 'cover' }} // Altura fija más pequeña
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
            <IconButton
              onClick={handleCapturePhoto}
              sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
            >
              <CameraIcon sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <IconButton
            onClick={toggleCamera}
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            <SwitchCameraIcon sx={{ color: '#fff' }} />
          </IconButton>
          <IconButton
            onClick={() => setPhotoModalOpen(false)}
            sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
          >
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* Modal para tomar foto 2 */}
      <Dialog
        open={isPhoto2ModalOpen}
        onClose={() => setPhoto2ModalOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', maxHeight: '70vh', width: '90%', maxWidth: '400px' } }} // Reducir altura y ajustar ancho del modal
      >
        <DialogTitle>Cédula Posterior</DialogTitle>
        <DialogContent sx={{ padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}> {/* Evitar scroll interno */}
          <Box sx={{ flex: '0 1 auto', maxHeight: '200px', overflow: 'hidden' }}> {/* Limitar altura del contenedor del Webcam */}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ width: 1280, height: 720, facingMode }}
              style={{ borderRadius: '8px', width: '100%', height: '200px', objectFit: 'cover' }} // Altura fija más pequeña
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
            <IconButton
              onClick={handleCapturePhoto2}
              sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
            >
              <CameraIcon sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <IconButton
            onClick={toggleCamera}
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            <SwitchCameraIcon sx={{ color: '#fff' }} />
          </IconButton>
          <IconButton
            onClick={() => setPhoto2ModalOpen(false)}
            sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
          >
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistrationForm;
