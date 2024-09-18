const { Admin } = require('./database');
const bcrypt = require('bcrypt');

const adminUsers = [
  { username: 'counter-cebollar-admin', password: 'doriancebollar24' },
  { username: 'counter-gonzalez-admin', password: 'doriangonzalez24' },
  { username: 'counter-pi-admin', password: 'dorianpi2024' },
  { username: 'gimnasios-dorian', password: 'Gonza2024*..' },
];

const initializeAdmins = async () => {
  try {
    for (let user of adminUsers) {
      const existingAdmin = await Admin.findOne({
        where: { username: user.username },
      });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await Admin.create({
          username: user.username,
          password: hashedPassword,
        });
        console.log(`Admin user ${user.username} created`);
      } else {
        console.log(`Admin user ${user.username} already exists`);
      }
    }
  } catch (error) {
    console.error('Error initializing admins:', error);
  }
};

const initDb = async () => {
  await initializeAdmins();
};

initDb();
