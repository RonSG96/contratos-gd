const { Admin } = require('./database');
const bcrypt = require('bcrypt');

const initializeAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      await Admin.create({ username: 'admin', password: hashedPassword });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

const initDb = async () => {
  await initializeAdmin();
};

initDb();
