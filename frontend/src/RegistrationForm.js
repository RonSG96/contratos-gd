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
  Checkbox,
  FormControlLabel,
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
  const [isContractModalOpen, setContractModalOpen] = useState(false);
  const [isAgreeChecked, setAgreeChecked] = useState(false);
  const [isSignatureDone, setSignatureDone] = useState(false);
  const [isPhotoTaken, setPhotoTaken] = useState(false);
  const [isFinalButtonDisabled, setFinalButtonDisabled] = useState(true);
  const [isSignButtonEnabled, setSignButtonEnabled] = useState(false); // Nueva variable para controlar el botón de Firmar

  const sigCanvas = useRef({});
  const webcamRef = useRef(null);

  const apiUrl = process.env.REACT_APP_API_URL;

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
    setSignatureDone(true);
    checkIfCanEnableAgree();
  };

  const handleClearSignature = () => {
    sigCanvas.current.clear();
    setSignatureDataURL('');
  };

  const handleCapturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setPhotoDataURL(photo);
    setPhotoModalOpen(false);
    setPhotoTaken(true);
    checkIfCanEnableAgree();
  };

  const checkIfCanEnableAgree = () => {
    if (signatureDataURL && photoDataURL) {
      setAgreeChecked(false); // Resetear el check si hay cambios
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
    setSignButtonEnabled(true); // Activamos el botón de firmar al cerrar el modal del contrato
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
        setAgreeChecked(false);
        setFinalButtonDisabled(true);
        setSignButtonEnabled(false);
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
                disabled={!isSignButtonEnabled} // Botón firmar solo habilitado cuando se cierre el modal del contrato
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={isAgreeChecked}
                  onChange={handleAgreeChange}
                  disabled={!signatureDataURL || !photoDataURL}
                />
              }
              label="Estoy de acuerdo con el contrato"
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
        <DialogTitle>Contrato de Gimnasios Dorian</DialogTitle>
        <DialogContent dividers style={{ height: '400px', overflowY: 'auto' }}>
          {/* Aquí va el contrato con el scroll */}
          <Typography variant="body2" component="div">
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
            GIMNASIO DORIAN...
            <br />
            <br />
            <b>1. Normas de Funcionamiento:</b>
            <br />
            1.1. Está prohibido fumar dentro de las instalaciones.
            <br />
            1.2. El consumo del alcohol o sustancias sujetas a fiscalización...
            <br />
            1.3. No se permite el consumo de alimentos dentro de las
            instalaciones, salvo en las zonas expresamente habilitadas para
            ello.
            <br />
            1.4. Está prohibida Ja entrada de animales a las instalaciones.
            <br />
            1.5. Se deberá usar ropa y calzados adecuados para las actividades y
            servicios prestados.
            <br />
            1.6. Se habrá de dejar los equipos y las instalaciones en las
            condiciones que se las encontró previo al uso, es decir, sin sudor,
            sin residuos de ningún tipo libres disponibles para el resto de
            usuarios.
            <br />
            1.7. Se deberá hacer uso correcto del equipamiento e implementos del
            gimnasio. siendo responsable el usuario de cualquier deterioro que
            se causase por uso indebido.
            <br />
            1.8. La sustracción y/o destrucción o dañó material de cualquier
            equipo o implemento de la instalación, significará la expulsión
            automática de las instalaciones, sin perjuicio de las acciones
            civiles y penales que puedan derivar.
            <br />
            1.9. Debe respetarse la higiene de las instalaciones, haciendo el
            uso debido de papeleras de reciclaje para depositar los desperdicios
            de cualquier tipo.
            <br />
            1.10. Se respetarán los horarios establecidos para las actividades
            en las instalaciones.
            <br />
            1.11. Se pagará de forma puntal y sin retraso la mensualidad
            requerida.
            <br />
            1.12. El hecho de permitir pagar fuera de fecha, no implica bajo
            ninguna circunstancia renuncia a la cantidad debida.
            <br />
            1.13. El acceso y uso de las instalaciones está reservado únicamente
            a los usuarios que tengan la calidad de miembro. La participación en
            la introducción no autorizada de personas ajenas, no se encuentra
            permitida.
            <br />
            1.14. Las instalaciones están equipadas con sistemas de vigilancia y
            seguridad con grabación de imagen, al acceder al presente acuerdo,
            usted acepta ser grabado.
            <br />
            1.15. El personal se encargará de velar por el cumplimiento de las
            normas de conducta y de uso de las instalaciones.
            <br />
            1.16. Gimnasio Dorian se reserva limitar o impedir el acceso a las
            instalaciones cuando las circunstancias y/o la seguridad de las
            personas así lo ameriten.
            <br />
            1.17. Los implementos y accesorios, deben permanecer en las
            instalaciones, debiendo dejarse tras su uso en el sitio correcto y
            en orden.
            <br />
            1.18. Las recomendaciones o solicitudes que presenten los clientes
            deberán ser dirigidas de manera escrita a la administración a que
            puedan ser canalizadas de la mejor manera.
            <br />
            <br />
            <b>2. Vestuarios y Casilleros</b>
            <br />
            <br />
            2.1. DORIAN GIMNASIO no se responsabiliza de pérdidas, daños
            materiales, sustracción de dinero o de otros artículos de valor que
            se deje en los casilleros.
            <br />
            2.2. No está permitido afeitarse en las duchas por motivos de
            higiene, sanitarios y de seguridad.
            <br />
            2.3. Se ruega dejar los vestidores de la misma manera en que fueron
            encontrados.
            <br />
            <br />
            <b>3. Responsabilidad</b>
            <br />
            3.1. GIMNASIO DORIAN no será responsable de los problemas de salud
            que pueda sufrir a consecuencia del "mal" uso de nuestras
            instalaciones o de nuestros programas de ejercicios. Por lo tanto,
            recomendamos que consulte con un médico antes de contratar nuestros
            servicios en caso de que tenga la tensión alta, angina de pecho,
            cardiopatía, diabetes, enfermedad crónica, desmayos y, en general,
            si concurre cualquier otra circunstancia que afecte a tu salud y
            forma fisica. Con la suscripción del presente contrato, usted
            declara que está en buenas condiciones para la realización de
            ejercicio físico.
            <br />
            <br />
            3.2. Adicionalmente, GIMNASIO DORIAN no se hará responsable en caso
            de lesión debido a:
            <br />
            A. No prestar atención indicaciones del entrenador. a las
            <br />
            B. No realizar la debida preparación corporal para realizar la
            rutina de entrenamiento, es decir, calentamiento.
            <br />
            C. Afecciones cutáneas debido al no uso de la toalla.
            <br />
            D. Utilizar ropa indebida para realizar ejercicio.
            <br />
            E. Mal uso de las máquinas y demás implementos del Gimnasio.
            <br />
            F. Ejecución de los ejercicios sin realizar la técnica
            correctamente.
            <br />
            G. No haber hecho uso del instructor.
            <br />
            H. Por no comunicar lesiones o circunstancias de salud anteriores.
            <br />
            I. Por no utilizar implementos de seguridad durante el
            entrenamiento, como: cinturón, guantes, vendas, agarraderas, entre
            otros.
            <br />
            J. Accidentes ocasionados por terceros, sin perjuicio de la
            posibilidad de exigirle al causante del daño, la reparación debida.
            <br />
            K. Irrespeto a los protocolos de las clases grupales.
            <br />
            L. Ingresar en estado etilico o bajo el efecto sustancias
            estupefacientes.
            <br />
            M. Por no haber informado de padecer algún desorden alimenticio o
            cualquier otra enfermedad.
            <br />
            N. Por no alimentarse de una manera correcta antes, durante y
            después de realizar los ejercicios.
            <br />
            <b>4. Incumplimiento</b>
            <br />
            4.1. En caso de incumplimiento, GIMNASIO DORIAN se reserva la
            posibilidad de expulsar a dicho usuario...
            <br />
            <b>5. Política de Congelamiento de Planes</b>
            <br />
            Los planes no serán sujetos a devoluciones o extensiones...
            <br />
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
