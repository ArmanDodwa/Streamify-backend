const mongoose = require("mongoose");

const conntectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`mongoose are conntect ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connect to mongoosedb",error);
    throw error;
    process.exit(1) // 1 means failure
  }
};

module.exports = conntectDb;
