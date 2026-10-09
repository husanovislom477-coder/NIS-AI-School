const { initDB } = require('../services/db');

const connectDB = async () => {
  try {
    await initDB();
    return true;
  } catch (error) {
    console.error(`⚠️ Database initialization error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
