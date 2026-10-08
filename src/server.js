import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/Index.js";
import { errorHandler } from "./middleware/ErrorMiddleware.js";
import { notFoundHandler } from "./middleware/NotFoundMiddleware.js";
import * as functions from 'firebase-functions';
import { Readable } from 'stream';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Firebase functions consume the request stream into req.rawBody, breaking Multer.
// This middleware restores the stream so Multer can parse file uploads properly.
app.use((req, res, next) => {
    if (req.rawBody && req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
        const stream = new Readable();
        stream.push(req.rawBody);
        stream.push(null);
        req.pipe = stream.pipe.bind(stream);
        req.unpipe = stream.unpipe.bind(stream);
        req.on = stream.on.bind(stream);
        req.resume = stream.resume.bind(stream);
    }
    next();
});

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

export const api = functions.https.onRequest(app);

