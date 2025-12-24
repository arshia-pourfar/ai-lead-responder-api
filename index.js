import express from "express";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/analyze", analyzeRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
