import express from "express";
import { analyzeLead } from "../services/gemini.js";
import { addReplyToSheet } from "../services/googleSheet.js";
import { detectCategory } from "../services/classifier.js";
import { sendAutoReply } from "../services/email.js";

const router = express.Router();

router.post("/", async (req, res) => {
    let { category, message, name, email } = req.body;

    if (!message) {
        return res.status(400).json({ error: "message required" });
    }

    try {
        if (!category) {
            category = await detectCategory(message);
        }

        const result = await analyzeLead(category, message);

        await addReplyToSheet(
            name || "Unknown",
            email || "N/A",
            message,
            category,
            result.reply
        );

        const emailSent = await sendAutoReply(email, result.reply, category);

        res.json({
            category,
            reply: result.reply,
            emailSent
        });

    } catch (err) {
        console.error("Route error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
