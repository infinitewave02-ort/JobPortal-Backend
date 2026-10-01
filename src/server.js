import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/Index.js";
import { errorHandler } from "./middleware/ErrorMiddleware.js";
import { notFoundHandler } from "./middleware/NotFoundMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Job Portal Backend is running"
  });
});

// Global Error Handling (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});