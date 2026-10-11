import express from "express";
import cors from "cors"; // Force redeploy
import dotenv from "dotenv";
import apiRoutes from "./routes/Index.js";
import { errorHandler } from "./middleware/ErrorMiddleware.js";
import { notFoundHandler } from "./middleware/NotFoundMiddleware.js";
import * as functions from 'firebase-functions';
import { Readable } from 'stream';
import { ensureDefaultAdmin } from './services/AdminService.js';


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

// Only start the server locally when executed directly (e.g. node src/server.js).
// Never start the server or run top-level async work when loaded by Firebase Functions.
const isCloudRuntime = Boolean(
  process.env.K_SERVICE ||
  process.env.FUNCTION_NAME ||
  process.env.FUNCTION_TARGET ||
  process.env.FUNCTIONS_CONTROL_API ||
  process.env.FIREBASE_CONFIG ||
  process.env.FUNCTIONS_EMULATOR
);

const isDirectRun = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server')) &&
  !isCloudRuntime
);

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    ensureDefaultAdmin().catch((err) => console.error('ensureDefaultAdmin error:', err?.message || err));
  });
}

export const api = functions.https.onRequest(app);


