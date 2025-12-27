import express from "express";
import dotenv from "dotenv";
import { startAutoEmailProcessing } from "./services/autoEmailProcessor.js";

dotenv.config();
const app = express();
app.use(express.json());

startAutoEmailProcessing(10000); // هر ۱ دقیقه فقط ۱ ایمیل

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
