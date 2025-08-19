const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy for production
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for production
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// CORS configuration - FIXED
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://localhost:5173",
      "https://your-frontend-domain.com", // Replace with your actual domain
      "https://restoranprojectpos.netlify.app", // Replace with your actual Netlify domain
      "https://your-frontend-domain.vercel.app", // Replace with your actual Vercel domain
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Default root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Coffee Shop API 🚀",
    docs: "/api",
    health: "/health",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Coffee Shop API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Coffee Shop API",
    version: "1.0.0",
    currency: "IDR",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/profile",
      },
      users: {
        getAll: "GET /api/users",
        create: "POST /api/users",
        update: "PUT /api/users/:id",
        delete: "DELETE /api/users/:id",
        toggleStatus: "PATCH /api/users/:id/toggle-status",
      },
      menu: {
        getAll: "GET /api/menu",
        getById: "GET /api/menu/:id",
        create: "POST /api/menu",
        update: "PUT /api/menu/:id",
        delete: "DELETE /api/menu/:id",
        updateStock: "PATCH /api/menu/:id/stock",
        getCategories: "GET /api/menu/categories",
      },
      orders: {
        getAll: "GET /api/orders",
        getById: "GET /api/orders/:id",
        create: "POST /api/orders",
        updateStatus: "PATCH /api/orders/:id/status",
        getStats: "GET /api/orders/stats",
      },
      payment: {
        create: "POST /api/payment/create",
        notification: "POST /api/payment/notification",
        status: "GET /api/payment/status/:orderId",
      },
      shifts: {
        current: "GET /api/shifts/current",
        getAll: "GET /api/shifts",
        clockOut: "POST /api/shifts/clock-out",
        getStats: "GET /api/shifts/stats",
      },
      dashboard: {
        stats: "GET /api/dashboard/stats",
        revenueReport: "GET /api/dashboard/reports/revenue",
        productReport: "GET /api/dashboard/reports/products",
        staffReport: "GET /api/dashboard/reports/staff",
        customerReport: "GET /api/dashboard/reports/customers",
      },
    },
    documentation: "Visit /api-test for interactive API testing",
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// 404 handler for web routes
// 404 handler for all routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "The page you are looking for does not exist.",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Multer errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large",
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 Coffee Shop Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
💰 Currency: IDR (Indonesian Rupiah)
📱 Web Interface: http://localhost:${PORT}
🔧 API Docs: http://localhost:${PORT}/api
🧪 API Testing: http://localhost:${PORT}/api-test
📊 Reports: http://localhost:${PORT}/reports
⚡ Health Check: http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;
