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

  // Título del documento
  doc.fontSize(20).text('Bienvenid@ a:', { align: 'left', indent: 20 });

  // Logotipo del gimnasio
  doc.image(path.join(__dirname, 'assets', 'logo-dorian.png'), 450, 50, {
    width: 200, // Tamaño ajustado del logotipo
    align: 'right',
    valign: 'top',
  });

  doc.moveDown(2); // Espacio después del logo y el título

  // Normas de funcionamiento
  doc.moveDown(1); // Espacio antes del título de la sección
  doc.fontSize(14).text('1. Normas de Funcionamiento', { underline: true });
  doc.moveDown(1); // Espacio después del título de la sección
  doc
    .fontSize(12)
    .text('1.1 Está prohibido fumar dentro de las instalaciones.');
  doc.text(
    '1.2 El consumo del alcohol o sustancias sujetas a fiscalización está terminantemente prohibido en las instalaciones.'
  );
  doc.text(
    '1.3 No se permite el consumo de alimentos dentro de las instalaciones, salvo en las zonas expresamente habilitadas para ello.'
  );
  doc.text('1.4 Está prohibida la entrada de animales a las instalaciones.');
  doc.text(
    '1.5 Se deberá usar ropa y calzados adecuados para las actividades y servicios prestados.'
  );
  doc.moveDown(2); // Espacio después del bloque de texto

  // Vestuarios y Casilleros
  doc.moveDown(1); // Espacio antes del título de la sección
  doc.fontSize(14).text('2. Vestuarios y Casilleros', { underline: true });
  doc.moveDown(1); // Espacio después del título de la sección
  doc
    .fontSize(12)
    .text(
      '2.1 DORIAN GIMNASIO no se responsabiliza de pérdidas, daños materiales, sustracción de dinero o de otros artículos de valor que se deje en los casilleros.'
    );
  doc.text(
    '2.2 No está permitido afeitarse en las duchas por motivos de higiene, sanitarios y de seguridad.'
  );
  doc.text(
    '2.3 Se ruega dejar los vestidores de la misma manera en que fueron encontrados.'
  );
  doc.moveDown(2); // Espacio después del bloque de texto

  // Responsabilidad
  doc.moveDown(1); // Espacio antes del título de la sección
  doc.fontSize(14).text('3. Responsabilidad', { underline: true });
  doc.moveDown(1); // Espacio después del título de la sección
  doc
    .fontSize(12)
    .text(
      '3.1 GIMNASIO DORIAN no será responsable de los problemas de salud que pueda sufrir a consecuencia del "mal" uso de nuestras instalaciones o de nuestros programas de ejercicios.'
    );
  doc.text(
    '3.2 Adicionalmente, GIMNASIO DORIAN no se hará responsable en caso de lesión debido a:'
  );
  doc.text('A. No prestar atención indicaciones del entrenador.');
  doc.text(
    'B. No realizar la debida preparación corporal para realizar la rutina de entrenamiento, es decir, calentamiento.'
  );
  doc.text('C. Afecciones cutáneas debido al no uso de la toalla.');
  doc.text('D. Utilizar ropa indebida para realizar ejercicio.');
  doc.text('E. Mal uso de las máquinas y demás implementos del Gimnasio.');
  doc.text(
    'F. Ejecución de los ejercicios sin realizar la técnica correctamente.'
  );
  doc.text('G. No haber hecho uso del instructor.');
  doc.text(
    'H. Por no comunicar lesiones o circunstancias de salud anteriores.'
  );
  doc.text(
    'I. Por no utilizar implementos de seguridad durante el entrenamiento, como: cinturón, guantes, vendas, agarraderas, entre otros.'
  );
  doc.text(
    'J. Accidentes ocasionados por terceros, sin perjuicio de la posibilidad de exigirle al causante del daño, la reparación debida.'
  );
  doc.text('K. Irrespeto a los protocolos de las clases grupales.');
  doc.text(
    'L. Ingresar en estado etílico o bajo el efecto de sustancias estupefacientes.'
  );
  doc.text(
    'M. Por no haber informado de padecer algún desorden alimenticio o cualquier otra enfermedad.'
  );
  doc.text(
    'N. Por no alimentarse de una manera correcta antes, durante y después de realizar los ejercicios.'
  );
  doc.moveDown(2); // Espacio después del bloque de texto

  // Incumplimiento
  doc.moveDown(1); // Espacio antes del título de la sección
  doc.fontSize(14).text('4. Incumplimiento', { underline: true });
  doc.moveDown(1); // Espacio después del título de la sección
  doc
    .fontSize(12)
    .text(
      '4.1 En caso de incumplimiento, GIMNASIO DORIAN se reserva la posibilidad de expulsar a dicho usuario, sin restitución de gastos y sin perjuicio de las acciones legales que pudieran derivar.'
    );
  doc.moveDown(2); // Espacio después del bloque de texto

  // Política de congelamiento de planes
  doc.moveDown(1); // Espacio antes del título de la sección
  doc
    .fontSize(14)
    .text('5. Política de Congelamiento de Planes', { underline: true });
  doc.moveDown(1); // Espacio después del título de la sección
  doc
    .fontSize(12)
    .text(
      'Los planes no serán sujetos a devoluciones o extensiones, y tendrán validez durante el tiempo y por el monto acordado.'
    );
  doc.moveDown(2); // Espacio después del bloque de texto

  // Detalles del usuario con formato mejorado
  doc.moveDown(3); // Añadir espacio entre el último texto y la firma
  doc
    .fontSize(12)
    .text(
      `Yo, ${user.nombre} ${user.apellido}, con cédula de ciudadanía ${user.cedula}, declaro que he leído y acepto los términos y condiciones.`,
      {
        align: 'left',
        indent: 40,
        lineGap: 10,
      }
    );

  // Espacio para separar la firma
  doc.moveDown();

  // Agregar detalles del contrato con espacio entre cada línea
  doc.text(`Fecha: ${new Date(user.fecha_inscripcion).toLocaleDateString()}`, {
    align: 'left',
    indent: 40,
    lineGap: 5,
  });

  doc.text(`Plan contratado: ${user.plan_contratado}`, {
    align: 'left',
    indent: 40,
    lineGap: 5,
  });

  doc.text(`Dirección: ${user.direccion}`, {
    align: 'left',
    indent: 40,
    lineGap: 5,
  });

  doc.text(`Teléfono: ${user.telefono}`, {
    align: 'left',
    indent: 40,
    lineGap: 5,
  });

  doc.text(`Correo: ${user.correo}`, {
    align: 'left',
    indent: 40,
    lineGap: 5,
  });

  doc.moveDown(2);

  doc.text('Firma del usuario:', {
    align: 'left', // Alinear el texto a la izquierda
    lineGap: 15, // Espacio extra debajo del texto
  });

  doc.moveDown(1);

  doc.image(firmaPath, {
    fit: [100, 50], // Tamaño más pequeño para la firma
    align: 'center', // Centrar la imagen de la firma
    valign: 'top',
  });

  doc.moveDown(2); // Añadir espacio extra entre la firma y la foto

  doc.text('Foto del usuario:', {
    align: 'left',
    lineGap: 15,
  });

  doc.moveDown(1);

  // Redimensionar la imagen de la foto y centrarla
  doc.image(fotoPath, {
    fit: [100, 100],
    align: 'center',
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
