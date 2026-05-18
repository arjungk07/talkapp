// ✅ dotenv MUST be first — before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import session from "express-session";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socketHandler.js";
import uploadRoutes from "./routes/Sidebar/uploadRoutes.js";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";


// ✅ Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

// ✅ CORS — must be before all routes and body parsers
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Request logger — this is why you saw nothing before
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ✅ Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // ✅ false is safer — only save when modified
    cookie: {
      secure: process.env.NODE_ENV === "production", // ✅ https only in prod
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);



app.use("/uploads", express.static("uploads"));//server uploaded images

// ✅ Routes
app.use('/api/auth', authRoutes)
app.use("/api/users", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "TalkApp API is running 🚀", status: "OK" });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log(`⚠️  404 — ${req.method} ${req.path}`);
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
  });
});

// ✅ Init socket handlers
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Accepting requests from: ${process.env.CLIENT_URL}`);
  console.log(`📡 Socket.IO ready`);
});