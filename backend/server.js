const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { addMonths } = require('date-fns');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const canvas = require('canvas');
const { sequelize, User, Admin, initDb } = require('./database');

const app = express();
const PORT = 5500;
const SECRET_KEY = 'your_secret_key';
const TEMPORARY_TOKEN_KEY = 'temporary_secret_key';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Servir archivos estáticos desde gym-registration/src/assets
app.use(
  '/assets',
  express.static(path.join(__dirname, '../frontend/src/assets'))
);

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token;
  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Nueva ruta para generar una URL segura con token temporal
app.get('/user/:id/qr-url', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Genera un token temporal válido por 10 minutos
    const token = jwt.sign({ id: user.id }, TEMPORARY_TOKEN_KEY, {
      expiresIn: '10m',
    });

    const qrUrl = `https://contratos-backend.onrender.com/user/${user.id}/qr?token=${token}`;
    res.json({ qrUrl });
  } catch (error) {
    console.error('Error al generar la URL del QR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ruta para mostrar el QR del usuario
app.get('/user/:id/qr', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      console.error(`User with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    const estado = user.estado === 'activo' ? 'aprobado' : 'caducado';
    const imagePath =
      estado === 'aprobado' ? '/assets/aprobado.jpg' : '/assets/caducado.jpg';

    res.sendFile(path.join(__dirname, imagePath));
  } catch (error) {
    console.error('Error fetching user QR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ruta para descargar el QR Code con fondo personalizado
app.get('/user/:id/download-qr', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const qrData = `https://contratos-backend.onrender.com/user/${user.id}/qr`;

    const canvasEl = canvas.createCanvas(500, 500);
    const ctx = canvasEl.getContext('2d');

    const background = await canvas.loadImage(
      path.join(__dirname, 'assets', 'qr-background.jpg')
    );
    ctx.drawImage(background, 0, 0, 500, 500);

    await QRCode.toCanvas(canvasEl, qrData, { width: 200 });
    ctx.drawImage(canvasEl, 150, 150);

    const buffer = canvasEl.toBuffer('image/png');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="user_${user.id}_qr.png"`
    );
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating QR code image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/submit', async (req, res) => {
  const {
    nombre,
    apellido,
    cedula,
    plan_contratado,
    direccion,
    telefono,
    correo,
    firma,
    sucursal,
    foto,
  } = req.body;

  const fecha_inscripcion = new Date();
  let fecha_expiracion;

  switch (plan_contratado) {
    case 'Plan Mensual':
      fecha_expiracion = addMonths(fecha_inscripcion, 1);
      break;
    case 'Plan Trimestral':
      fecha_expiracion = addMonths(fecha_inscripcion, 3);
      break;
    case 'Plan Semestral':
      fecha_expiracion = addMonths(fecha_inscripcion, 6);
      break;
    case 'Plan Anual':
      fecha_expiracion = addMonths(fecha_inscripcion, 12);
      break;
    default:
      return res
        .status(400)
        .json({ status: 'error', message: 'Tipo de plan no válido' });
  }

  const estado = fecha_expiracion > new Date() ? 'activo' : 'inactivo';

  const firmaData = firma.replace(/^data:image\/png;base64,/, '');
  const firmaPath = path.join(__dirname, 'signatures', `${cedula}.png`);
  fs.writeFileSync(firmaPath, firmaData, 'base64');

  const fotoData = foto.replace(/^data:image\/jpeg;base64,/, '');
  const fotoPath = path.join(__dirname, 'photos', `${cedula}.jpg`);
  fs.writeFileSync(fotoPath, fotoData, 'base64');

  try {
    const user = await User.create({
      nombre,
      apellido,
      cedula,
      fecha_inscripcion,
      plan_contratado,
      fecha_expiracion,
      direccion,
      telefono,
      correo,
      firma: firmaPath,
      sucursal,
      foto: fotoPath,
      estado,
    });

    const qrData = `https://contratos-backend.onrender.com/user/${user.id}/qr`;
    const qrCode = await QRCode.toDataURL(qrData);

    user.qr_code = qrCode;
    await user.save();

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.json({ status: 'error', message: error.message });
  }
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id }, SECRET_KEY);
  res.json({ token });
});

app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get('/user/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const {
    fecha_inscripcion,
    plan_contratado,
    nombre,
    apellido,
    correo,
    direccion,
    telefono,
  } = req.body;

  const newFechaInscripcion = new Date(fecha_inscripcion);
  let fecha_expiracion;

  switch (plan_contratado) {
    case 'Plan Mensual':
      fecha_expiracion = addMonths(newFechaInscripcion, 1);
      break;
    case 'Plan Trimestral':
      fecha_expiracion = addMonths(newFechaInscripcion, 3);
      break;
    case 'Plan Semestral':
      fecha_expiracion = addMonths(newFechaInscripcion, 6);
      break;
    case 'Plan Anual':
      fecha_expiracion = addMonths(newFechaInscripcion, 12);
      break;
    default:
      return res
        .status(400)
        .json({ status: 'error', message: 'Tipo de plan no válido' });
  }

  const estado = fecha_expiracion > new Date() ? 'activo' : 'inactivo';

  try {
    const qrData = `https://contratos-backend.onrender.com/user/${id}/qr`;
    const qrCode = await QRCode.toDataURL(qrData);

    await User.update(
      {
        nombre,
        apellido,
        correo,
        direccion,
        telefono,
        fecha_inscripcion: newFechaInscripcion,
        plan_contratado,
        fecha_expiracion,
        estado,
        qr_code: qrCode,
      },
      { where: { id } }
    );
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.json({ status: 'error', message: error.message });
  }
});

app.put('/user/estado/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    await User.update({ estado }, { where: { id } });
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    res.json({ status: 'error', message: error.message });
  }
});

app.delete('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await User.destroy({ where: { id } });
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.json({ status: 'error', message: error.message });
  }
});

app.get('/download/:cedula', async (req, res) => {
  const user = await User.findOne({ where: { cedula: req.params.cedula } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const firmaPath = path.join(__dirname, 'signatures', `${user.cedula}.png`);
  const fotoPath = path.join(__dirname, 'photos', `${user.cedula}.jpg`);

  // Verificar si los archivos existen
  if (!fs.existsSync(firmaPath) || !fs.existsSync(fotoPath)) {
    return res.status(404).json({ message: 'Firma o foto no encontradas' });
  }

  const doc = new PDFDocument();
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    let pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${user.cedula}.pdf`,
      })
      .end(pdfData);
  });
  doc.image(path.join(__dirname, 'assets', 'logo-dorian.png'), {
    fit: [200, 100], // Tamaño ajustado
    align: 'center', // Centrar el logotipo
    valign: 'top',
    x: 220, // Ajusta la posición en el eje X para centrarlo en la página
    y: 30, // Colocar el logotipo más cerca de la parte superior de la página
  });

  doc.moveDown(6); // Añadir espacio después del logotipo
  doc.fontSize(16).text('Bienvenid@ a:', { align: 'justify' });

  // Espacio después del logo
  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(
      'Le agradecemos, haya escogido los productos y servicios que presta GIMNASIO DORIAN (en adelante "los servicios"). Los servicios se proporcionan en el gimnasio por usted seleccionado.',
      { align: 'justify' } // Justificación del texto
    )
    .moveDown();

  doc
    .text(
      'El uso de nuestros servicios constituye una aceptación total de estas condiciones y la posibilidad de aplicar las leyes necesarias de ser el caso. Razón por la que recomendamos que las lea detenidamente y con atención, y de ser posible guardarlos. Si usted no se encuentra de acuerdo con ellos, no debe usar nuestros servicios bajo ninguna excusa.',
      { align: 'justify' } // Justificación del texto
    )
    .moveDown()
    .fontSize(12);

  // Normas de Funcionamiento
  doc.fontSize(14).text('1. Normas de Funcionamiento', { underline: true });
  doc.moveDown(0.5);

  const normas = [
    '1.1 Está prohibido fumar dentro de las instalaciones.',
    '1.2 El consumo del alcohol o sustancias sujetas a fiscalización está terminantemente prohibido en las instalaciones.',
    '1.3 No se permite el consumo de alimentos dentro de las instalaciones, salvo en las zonas expresamente habilitadas para ello.',
    '1.4 Está prohibida la entrada de animales a las instalaciones.',
    '1.5 Se deberá usar ropa y calzados adecuados para las actividades y servicios prestados.',
    '1.6 Se habrá de dejar los equipos y las instalaciones en las condiciones que se las encontró previo al uso, es decir, sin sudor, sin residuos de ningún tipo libres disponibles para el resto de usuarios.',
    '1.7 Se deberá hacer uso correcto del equipamiento e implementos del gimnasio, siendo responsable el usuario de cualquier deterioro que se causase por uso indebido.',
    '1.8 La sustracción y/o destrucción o daño material de cualquier equipo o implemento de la instalación, significará la expulsión automática de las instalaciones, sin perjuicio de las acciones civiles y penales que puedan derivar.',
    '1.9 Debe respetarse la higiene de las instalaciones, haciendo el uso debido de papeleras de reciclaje para depositar los desperdicios de cualquier tipo.',
    '1.10 Se respetarán los horarios establecidos para las actividades en las instalaciones.',
    '1.11 Se pagará de forma puntual y sin retraso la mensualidad requerida.',
    '1.12 El hecho de permitir pagar fuera de fecha, no implica bajo ninguna circunstancia renuncia a la cantidad debida.',
    '1.13 El acceso y uso de las instalaciones está reservado únicamente a los usuarios que tengan la calidad de miembro. La participación en la introducción no autorizada de personas ajenas, no se encuentra permitida.',
    '1.14 Las instalaciones están equipadas con sistemas de vigilancia y seguridad con grabación de imagen, al acceder al presente acuerdo, usted acepta ser grabado.',
    '1.15 El personal se encargará de velar por el cumplimiento de las normas de conducta y de uso de las instalaciones.',
    '1.16 Gimnasio Dorian se reserva limitar o impedir el acceso a las instalaciones cuando las circunstancias y/o la seguridad de las personas así lo ameriten.',
    '1.17 Los implementos y accesorios, deben permanecer en las instalaciones, debiendo dejarse tras su uso en el sitio correcto y en orden.',
    '1.18 Las recomendaciones o solicitudes que presenten los clientes deberán ser dirigidas de manera escrita a la administración para que puedan ser canalizadas de la mejor manera.',
  ];

  normas.forEach((norma) => {
    doc
      .fontSize(12)
      .text(norma, { align: 'justify', indent: 20 })
      .moveDown(0.5);
  });

  // Vestuarios y Casilleros
  doc.moveDown(2);
  doc.fontSize(14).text('2. Vestuarios y Casilleros', { underline: true });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .text(
      '2.1 DORIAN GIMNASIO no se responsabiliza de pérdidas, daños materiales, sustracción de dinero o de otros artículos de valor que se dejen en los casilleros.',
      { align: 'justify' }
    )
    .moveDown();
  doc
    .text(
      '2.2 No está permitido afeitarse en las duchas por motivos de higiene, sanitarios y de seguridad.',
      { align: 'justify' }
    )
    .moveDown();
  doc
    .text(
      '2.3 Se ruega dejar los vestidores de la misma manera en que fueron encontrados.',
      { align: 'justify' }
    )
    .moveDown();

  // Responsabilidad
  doc.moveDown(2);
  doc.fontSize(14).text('3. Responsabilidad', { underline: true });
  doc.moveDown(0.5);
  const responsabilidades = [
    '3.1 GIMNASIO DORIAN no será responsable de los problemas de salud que pueda sufrir a consecuencia del mal uso de nuestras instalaciones o de nuestros programas de ejercicios. Por lo tanto, recomendamos que consulte con un médico antes de contratar nuestros servicios en caso de que tenga la tensión alta, angina de pecho, cardiopatía, diabetes, enfermedad crónica, desmayos y, en general, si concurre cualquier otra circunstancia que afecte a su salud y forma física. Con la suscripción del presente contrato, usted declara que está en buenas condiciones para la realización de ejercicio físico.',
    '3.2 Adicionalmente, GIMNASIO DORIAN no se hará responsable en caso de lesión debido a:',
    'A. No prestar atención a las indicaciones del entrenador.',
    'B. No realizar la debida preparación corporal para realizar la rutina de entrenamiento, es decir, calentamiento.',
    'C. Afecciones cutáneas debido al no uso de la toalla.',
    'D. Utilizar ropa indebida para realizar ejercicio.',
    'E. Mal uso de las máquinas y demás implementos del gimnasio.',
    'F. Ejecución de los ejercicios sin realizar la técnica correctamente.',
    'G. No haber hecho uso del instructor.',
    'H. Por no comunicar lesiones o circunstancias de salud anteriores.',
    'I. Por no utilizar implementos de seguridad durante el entrenamiento, como: cinturón, guantes, vendas, agarraderas, entre otros.',
    'J. Accidentes ocasionados por terceros, sin perjuicio de la posibilidad de exigirle al causante del daño la reparación debida.',
    'K. Irrespeto a los protocolos de las clases grupales.',
    'L. Ingresar en estado etílico o bajo el efecto de sustancias estupefacientes.',
    'M. Por no haber informado de padecer algún desorden alimenticio o cualquier otra enfermedad.',
    'N. Por no alimentarse de una manera correcta antes, durante y después de realizar los ejercicios.',
  ];

  responsabilidades.forEach((resp) => {
    doc.fontSize(12);
    doc.text(resp, { align: 'justify', indent: 20 }).moveDown(0.5).fontSize(12);
  });

  // Incumplimiento
  doc.moveDown(2);
  doc.fontSize(14).text('4. Incumplimiento', { underline: true });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .text(
      '4.1 En caso de incumplimiento, GIMNASIO DORIAN se reserva la posibilidad de expulsar a dicho usuario, sin restitución de gastos y sin perjuicio de las acciones legales que pudieran derivar.',
      { align: 'justify' }
    )
    .moveDown();

  // Política de Congelamiento de Planes
  doc.moveDown(2);
  doc
    .fontSize(14)
    .text('5. Política de Congelamiento de Planes', { underline: true });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .text(
      'Los planes no serán sujetos a devoluciones o extensiones, y tendrán validez durante el tiempo y por el monto acordado.',
      { align: 'justify' }
    )
    .moveDown();

  // Detalles del usuario con formato mejorado
  doc.moveDown(6); // Añadir espacio entre el último texto y la firma
  doc
    .fontSize(12)
    .text(
      `Yo, ${user.nombre} ${user.apellido}, con cédula de ciudadanía ${user.cedula}, declaro que he leído y acepto los términos y condiciones.`,
      {
        align: 'justify',
        lineGap: 10,
      }
    );

  // Espacio para separar la firma
  doc.moveDown();

  // Agregar detalles del contrato con espacio entre cada línea
  doc.text(`Fecha: ${new Date(user.fecha_inscripcion).toLocaleDateString()}`, {
    align: 'left',
    lineGap: 5,
  });

  doc.text(`Plan contratado: ${user.plan_contratado}`, {
    align: 'left',
    lineGap: 5,
  });

  doc.text(`Dirección: ${user.direccion}`, {
    align: 'left',
    lineGap: 5,
  });

  doc.text(`Teléfono: ${user.telefono}`, {
    align: 'left',
    lineGap: 5,
  });

  doc.text(`Correo: ${user.correo}`, {
    align: 'left',
    lineGap: 5,
  });

  doc.moveDown(2); // Añadir espacio entre el último texto y la firma

  // Firma del usuario alineada a la izquierda
  doc.text('Firma del usuario:', {
    align: 'left', // Mantener el texto alineado a la izquierda
    lineGap: 15, // Espacio extra debajo del texto
  });

  // Añadir espacio entre el texto de la firma y la imagen de la firma
  doc.moveDown(1.5); // Espacio entre "Firma del usuario:" y la imagen

  // Redimensionar la imagen de la firma y centrarla
  doc.image(firmaPath, {
    fit: [150, 75], // Tamaño más pequeño para la firma
    align: 'center', // Centrar la imagen de la firma
    valign: 'top',
    x: 220,
  });

  // Añadir espacio entre la firma y la foto
  doc.moveDown(4); // Espacio extra entre la firma y la foto

  // Foto del usuario alineada a la izquierda
  doc.text('Foto del usuario:', {
    align: 'left', // Mantener el texto alineado a la izquierda
    lineGap: 15, // Espacio extra debajo del texto
  });

  // Añadir espacio entre el texto de la foto y la imagen de la foto
  doc.moveDown(1.5); // Espacio entre "Foto del usuario:" y la imagen

  // Redimensionar la imagen de la foto y centrarla
  doc.image(fotoPath, {
    fit: [100, 100], // Tamaño ajustado para la foto
    align: 'center', // Centrar la imagen de la foto
    valign: 'top',
  });

  // Saltos de línea finales para asegurar que quede bien alineado
  doc.moveDown(2);

  doc.end();
});

const startServer = async () => {
  await initDb();

  // Inicializar el administrador si no existe
  const adminExists = await Admin.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin_password', 10); // Cambia 'admin_password' por la contraseña que prefieras
    await Admin.create({ username: 'admin', password: hashedPassword });
    console.log('Administrador creado con éxito.');
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
};

startServer();
