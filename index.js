import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { startAutoEmailProcessing } from "./services/autoEmailProcessor.js";
import dashboardRouter from "./routes/dashboard.js";
import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Enable CORS for all origins (یا فقط آدرس فرانت‌اندت رو بذار)
app.use(cors({
    origin: "*" // یا "http://localhost:3000" برای امنیت بیشتر
}));

// Routes
app.use("/dashboard", dashboardRouter);
app.use("/analyze", analyzeRouter);

// Start auto email processor (هر ۱۰ ثانیه یک ایمیل)
// startAutoEmailProcessing(10000);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
