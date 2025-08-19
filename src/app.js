const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

// Import routes
const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leaves");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Welcome team Symplora, to the HR's fav tool, the leave manager (because they love this part of therir job",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Leave Management System API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leaves", leaveRoutes);

module.exports = app;
