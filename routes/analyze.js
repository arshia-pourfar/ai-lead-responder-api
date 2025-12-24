import express from "express";
import { analyzeLead } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { category, message } = req.body;

    if (!category || !message) {
        return res.status(400).json({ error: "category and message required" });
    }

    try {
        const result = await analyzeLead(category, message);
        res.json(result);
    } catch (err) {
        console.error("Route error:", err);
        res.status(500).json({ reply: "Sorry, an error occurred while generating a reply." });
    }
});

export default router;
