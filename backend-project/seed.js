require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      username: 'admin',
      password: 'Admin@1234',
    });

    console.log('Admin user created: username=admin, password=Admin@1234');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
