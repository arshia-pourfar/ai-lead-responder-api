import express from "express";
import { analyzeLead } from "../services/gemini.js";
import { addReplyToSheet } from "../services/googleSheet.js";
import { detectCategory } from "../services/classifier.js";
import { sendAutoReply } from "../services/email.js";

const router = express.Router();

/**
 * POST /analyze
 * body: { message, name?, email?, category? }
 */
router.post("/", async (req, res) => {
    let { category, message, name, email } = req.body;

    if (!message) {
        return res.status(400).json({ error: "message required" });
    }

    try {
        // 🧠 تشخیص خودکار دسته
        if (!category) {
            category = await detectCategory(message);
        }

        // 🤖 تولید پاسخ AI
        const { reply } = await analyzeLead(category, message);

        // 📊 ذخیره در Google Sheet
        await addReplyToSheet(
            name || "Unknown",
            email || "N/A",
            message,
            category,
            reply
        );

        // 📧 ارسال ایمیل (در صورت فعال بودن)
        const emailSent = await sendAutoReply(email, reply, category);

        // ✅ پاسخ نهایی API
        res.json({
            category,
            reply,
            emailSent
        });

    } catch (err) {
        console.error("Analyze route error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
