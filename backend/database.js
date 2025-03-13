const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { addMonths } = require('date-fns');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
});

const User = sequelize.define('User', {
  nombre: { type: DataTypes.STRING, allowNull: true },
  apellido: { type: DataTypes.STRING, allowNull: false },
  cedula: { type: DataTypes.STRING, allowNull: false, unique: true },
  fecha_inscripcion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  plan_contratado: { type: DataTypes.STRING, allowNull: true },
  fecha_expiracion: { type: DataTypes.DATE, allowNull: true },
  direccion: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING, allowNull: false },
  correo: { type: DataTypes.STRING, allowNull: false, unique: true },
  firma: { type: DataTypes.STRING, allowNull: true },
  foto: { type: DataTypes.STRING, allowNull: true },
  firma_blob: { type: DataTypes.BLOB('long'), allowNull: true },
  foto_blob: { type: DataTypes.BLOB('long'), allowNull: true },
  foto_2_blob: { type: DataTypes.BLOB('long'), allowNull: true }, // Nuevo campo para la segunda foto
  sucursal: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'activo' },
  qr_code: { type: DataTypes.TEXT, allowNull: true },
  is_data_updated: { type: DataTypes.BOOLEAN, defaultValue: false }, // Campo ya añadido
});

const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, User, Admin, initDb };
