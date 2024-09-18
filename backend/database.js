const { Sequelize, DataTypes } = require('sequelize');

// Crear una nueva instancia de Sequelize usando las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // Puedes asegurar que el puerto también está definido como variable de entorno
    dialect: 'postgres',
  }
);

// Definir el modelo de User
const User = sequelize.define('User', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fecha_inscripcion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  plan_contratado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firma: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  foto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sucursal: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'activo', // 'activo' o 'inactivo'
  },
  qr_code: {
    type: DataTypes.TEXT, // Almacena la URL del código QR
    allowNull: true,
  },
});

// Definir el modelo de Admin
const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Inicializar la base de datos
const initDb = async () => {
  await sequelize.sync({ force: false });
  console.log('Database synced!');
};

module.exports = { sequelize, User, Admin, initDb };
