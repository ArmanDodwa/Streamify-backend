const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('../routes/auth-route');
const conntectDb = require('../lib/db');
const cookieParser = require("cookie-parser")
const userRoute = require("../routes/user-route")
const chatRoute = require("../routes/chat-route")
const mongoose = require("mongoose");
const cors = require("cors")

dotenv.config();

const app = express();
// const PORT = process.env.PORT ;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true,            
}));





// app.listen(PORT, () => {
//       console.log(`🚀 Server is running on http://localhost:${PORT}`);
//        conntectDb()
//     });

let isConnected = false; 

async function connectDb() {
  console.log("this function is run")
  if (isConnected) {
    console.log("🟢 MongoDB already connected");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
  }
}

app.use(async (req, res, next) => {
  console.log("this run")
  await connectDb();
  next();
});

app.get("/", (req, res) => {
  res.send("Server running!");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);

module.exports = app

