import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: true, //"http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All auth routes (JWT + OAuth)
app.use("/api/auth", authRoutes)

app.listen(process.env.PORT || 5000, () => {
  connectDB();
  console.log("Server is running on http://localhost:5000");
});
