const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('../routes/auth-route');
const conntectDb = require('../lib/db');
const cookieParser = require("cookie-parser")
const userRoute = require("../routes/user-route")
const chatRoute = require("../routes/chat-route")
const cors = require("cors")

dotenv.config();

const app = express();
const PORT = process.env.PORT ;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // frontend URL without trailing slash
  credentials: true,               // allow cookies
}));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);

let conntection = false;

async function conntectionDb(params) {
  conntectDb()
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });
}

app.use((req, res ,next)=>{
  if(!conntection){
    conntectDb();
  }
  next();
})

