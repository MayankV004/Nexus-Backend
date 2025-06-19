import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user-routes.js";
import authRoutes from "./routes/auth-routes.js";
import projectRoutes from "./routes/project-routes.js";
import issueRoutes from "./routes/issue-routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
connectDB()

const corsOptions = { 
  origin:"http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(
  cors(corsOptions)
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, 
  message: {
    success: false,
    message: "Too many authentication requests, please try again later.",
  },
});

app.use(limiter);
app.use(morgan("dev"));

//Routes

app.get('/',(req,res)=>{
    res.send("Nexus Server is Running!")
})

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/issues", issueRoutes);



// Error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error:", error);

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : error.message,
  });
})


app.listen(PORT, ()=>{
    console.log("Server is Running on PORT 5000!")
})