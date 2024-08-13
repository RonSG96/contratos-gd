const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Crear una nueva instancia de Sequelize
const sequelize = new Sequelize('suscripcion', 'admin', 'dorian2024', {
  host: 'localhost',
  port: 5433,
  dialect: 'postgres',
});

// Definir el modelo de User
const User = sequelize.define('User', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
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
    allowNull: false,
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
    allowNull: false,
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
