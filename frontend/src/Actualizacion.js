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
} from '@mui/material';
import logoDorian from './assets/logo-dorian.png';

const Actualizacion = () => {
  const [cedula, setCedula] = useState('');
  const [userData, setUserData] = useState(null);
  const [isContractModalOpen, setContractModalOpen] = useState(false);
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const sigCanvas = useRef({});
  const webcamRef = useRef(null);
  const [firma, setFirma] = useState(null);
  const [foto, setFoto] = useState(null);

  // Buscar usuario por cédula
  const buscarUsuario = async () => {
    try {
      const response = await fetch(`https://contratos-backend.onrender.com/api/actualizacion/${cedula}`);
      const data = await response.json();
      if (data.message) {
        alert('Usuario no encontrado');
      } else {
        setUserData(data);
        setFirma(data.firma || null);
        setFoto(data.foto || null);
      }
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      alert('Hubo un error al buscar el usuario.');
    }
  };

  // Guardar firma en formato imagen
  const handleSaveSignature = () => {
    const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    setFirma(signature);
    setSignatureModalOpen(false);
  };

  // Capturar foto desde la cámara
  const handleCapturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setFoto(photo);
    setPhotoModalOpen(false);
  };

  const actualizarDatos = async () => {
    try {
      const response = await fetch(`/api/actualizacion/${cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma, foto }),
      });

      const result = await response.json();
      alert(result.message || 'Datos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      alert('Error al actualizar la información.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center">Actualizar Datos</Typography>
      <Box display="flex" justifyContent="center" mt={2}>
        <TextField
          type="text"
          placeholder="Ingrese su cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button onClick={buscarUsuario} color="primary">Buscar</Button>
      </Box>

      {userData && (
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography><b>Nombre:</b> {userData.nombre} {userData.apellido}</Typography>
          <Typography><b>Plan contratado:</b> {userData.plan_contratado}</Typography>
          <Typography><b>Fecha de inscripción:</b> {new Date(userData.fecha_inscripcion).toLocaleDateString()}</Typography>
          <Typography><b>Dirección:</b> {userData.direccion}</Typography>
          <Typography><b>Teléfono:</b> {userData.telefono}</Typography>
          <Typography><b>Correo:</b> {userData.correo}</Typography>
          <Button onClick={() => setContractModalOpen(true)} color="primary">Ver Contrato</Button>

          {/* Firma */}
          <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            <Typography variant="h6">Firma actual:</Typography>
            {firma ? (
              <img src={firma} alt="Firma" width="200" />
            ) : (
              <Typography>No disponible</Typography>
            )}
            <Button onClick={() => setSignatureModalOpen(true)} color="primary">
              ACTUALIZAR FIRMA
            </Button>
          </Box>

          {/* Foto */}
          <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            <Typography variant="h6">Foto actual:</Typography>
            {foto ? (
              <img src={foto} alt="Foto" width="150" style={{ borderRadius: '8px' }} />
            ) : (
              <Typography>No disponible</Typography>
            )}
            <Button onClick={() => setPhotoModalOpen(true)} color="primary">
              ACTUALIZAR FOTO
            </Button>
          </Box>

          {/* Botón Finalizar */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Button onClick={actualizarDatos} variant="contained" color="primary">
              FINALIZAR
            </Button>
          </Box>
        </Paper>
      )}

      {/* Modal para ver contrato */}
      <Dialog open={isContractModalOpen} onClose={() => setContractModalOpen(false)} maxWidth="md" fullWidth>
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
              <b>4.1.</b>  En caso de incumplimiento, GIMNASIO DORIAN se reserva la posibilidad de expulsar a dicho usuario, sin restitución de gastos y sin perjuicio de las acciones legales que pudieran derivar.
              <br />
              <br />
              <b>5. Política de Congelamiento de Planes</b>
              <br />
              Los planes no serán sujetos a devoluciones o extensiones, y tendrán validez durante el tiempo y por el monto acordado.
              <br />
            </div>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

     {/* Modal para firmar */}
      <Dialog open={isSignatureModalOpen} onClose={() => setSignatureModalOpen(false)}>
        <DialogTitle>Firmar Contrato</DialogTitle>
        <DialogContent>
          <SignatureCanvas penColor="black" ref={sigCanvas} canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => sigCanvas.current.clear()}>Borrar</Button>
          <Button onClick={() => setSignatureModalOpen(false)}>Cerrar</Button>
          <Button onClick={handleSaveSignature}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para tomar foto */}
      <Dialog open={isPhotoModalOpen} onClose={() => setPhotoModalOpen(false)}>
        <DialogTitle>Tomar Foto</DialogTitle>
        <DialogContent>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoModalOpen(false)}>Cerrar</Button>
          <Button onClick={handleCapturePhoto}>Guardar Foto</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};


export default Actualizacion;
