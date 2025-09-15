const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();

const { initializeSocket } = require("./utilities/socket/socket.utlity.js");
const {
  initializeClubSocket,
} = require("./controllers/club-controller/club.controller.js"); // ⬅️ import your new club socket

const { securityMiddleware } = require("./middlewares/security.middleware");

const app = express();
const server = http.createServer(app);

// Initialize main socket
const io = initializeSocket(server);

// Initialize club socket with the same io instance
initializeClubSocket(io); // ⬅️ add this line

// ==================== BASE MIDDLEWARES ====================
securityMiddleware(app);
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

const corsOptions = {
  origin:
    process.env.ALLOWED_ORIGINS === "*"
      ? true
      : process.env.ALLOWED_ORIGINS.split(","),
  credentials: true,
  optionsSuccessStatus: 201,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGINS || "*"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Content-Type-Options"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ==================== BASE API ROUTES ====================
const superAdminRoute = require("./routes/super-admin-route/super-admin.route.js");
const userRoute = require("./routes/user-route/user.route.js");
const otpRoute = require("./routes/otp-route/otp.route.js");
const mediaRoute = require("./routes/media-route/media.route.js");
const coinPackageRoute = require("./routes/coin-package-route/coin.package.route.js");
const transactionRoute = require("./routes/transaction-route/transaction.route.js");
const followerRoute = require("./routes/follower-route/follower.route.js");

app.use("/api/super-admin", superAdminRoute);
app.use("/api/user", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/media", mediaRoute);
app.use("/api/coin-package", coinPackageRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/follow", followerRoute);

// ==================== SERVER HEALTH ====================
app.get("/api/health", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Server is running healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Backend is running properly",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// ==================== DB CONNECTION ====================
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// ==================== CLEANUP ====================
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

module.exports = app;
