import React, { useState, useRef, useCallback } from 'react';
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
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  SwitchCamera as SwitchCameraIcon,
  Rotate90DegreesCcw as RotateIcon,
} from '@mui/icons-material';
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
  const [facingMode, setFacingMode] = useState('user');
  const [rotation, setRotation] = useState(0);
  const [isDataUpdated, setIsDataUpdated] = useState(false); // Nuevo estado para is_data_updated

  const buscarUsuario = async () => {
    try {
      const response = await fetch(
        `https://contratos-backend.onrender.com/api/actualizacion/${cedula}`
      );
      const data = await response.json();
      if (data.message) {
        alert('Usuario no encontrado');
        setUserData(null);
        setFirma(null);
        setFoto(null);
        setFoto2(null);
        setIsDataUpdated(false); // Resetear al buscar un usuario no encontrado
      } else {
        setUserData(data);
        setFirma(data.firma_blob ? `data:image/jpeg;base64,${data.firma_blob}` : null);
        setFoto(data.foto_blob ? `data:image/jpeg;base64,${data.foto_blob}` : null);
        setFoto2(data.foto_2_blob ? `data:image/jpeg;base64,${data.foto_2_blob}` : null);
        setIsDataUpdated(data.is_data_updated || false); // Inicializar con el valor del servidor
      }
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      alert('Hubo un error al buscar el usuario.');
    }
  };

  const handleSaveSignature = () => {
    const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
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
        // Recargar los datos del usuario para reflejar is_data_updated
        const updatedResponse = await fetch(
          `https://contratos-backend.onrender.com/api/actualizacion/${cedula}`
        );
        const updatedData = await updatedResponse.json();
        setUserData(updatedData);
        setFirma(updatedData.firma_blob ? `data:image/jpeg;base64,${updatedData.firma_blob}` : null);
        setFoto(updatedData.foto_blob ? `data:image/jpeg;base64,${updatedData.foto_blob}` : null);
        setFoto2(updatedData.foto_2_blob ? `data:image/jpeg;base64,${updatedData.foto_2_blob}` : null);
        setIsDataUpdated(updatedData.is_data_updated || true); // Actualizar el estado
        setAgreementChecked(false); // Resetear el checkbox
      } else {
        alert(result.message || 'Error al actualizar los datos.');
      }
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      alert('Hubo un problema al actualizar los datos.');
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const rotateCamera = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const videoConstraints = {
    facingMode: facingMode,
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        background: '#d3d3d3',
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
        <Typography
          variant="h4"
          sx={{ color: '#000', fontFamily: 'Montserrat, sans-serif' }}
          gutterBottom
        >
          ACTUALIZACIÓN DE DATOS
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: '12px' }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <TextField
            label="Ingrese su cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: { xs: '100%', sm: '300px' }, mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={buscarUsuario}
            sx={{ width: { xs: '100%', sm: '150px' }, height: '40px', padding: '6px 16px' }}
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
                overflow: 'hidden',
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
                disabled={isDataUpdated} // Deshabilitar si isDataUpdated es true
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
                disabled={isDataUpdated} // Deshabilitar si isDataUpdated es true
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
                disabled={isDataUpdated} // Deshabilitar si isDataUpdated es true
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
                    disabled={isDataUpdated} // Deshabilitar si isDataUpdated es true
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
                disabled={!isAgreementChecked || !firma || !foto || !foto2 || isDataUpdated} // Deshabilitar si isDataUpdated es true
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
              la posibilidad de expulsar a dicho usuario, sin restitución de
              gastos y sin perjuicio de las acciones legales que pudieran
              derivar.
              <br />
              <br />
              <b>5. Política de Congelamiento de Planes</b>
              <br />
              Los planes no serán sujetos a devoluciones o extensiones, y
              tendrán validez durante el tiempo y por el monto acordado.
              <br />
            </div>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractModalOpen(false)}>Cerrar</Button>
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
            onClick={() => sigCanvas.current.clear()}
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
            videoConstraints={videoConstraints}
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
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
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px' } }}
      >
        <DialogTitle>Tomar Foto 2 (Reverso de Cédula)</DialogTitle>
        <DialogContent>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={videoConstraints}
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
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

export default Actualizacion;
