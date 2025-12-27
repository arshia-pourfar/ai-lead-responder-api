import { readOneEmail } from "./readEmail.js";
import { detectCategory } from "./classifier.js";
import { analyzeLead } from "./gemini.js";
import { addReplyToSheet } from "./googleSheet.js";
import { sendAutoReply } from "./email.js";

export function startAutoEmailProcessing(interval = 60000) {
    console.log("🤖 Auto Email Processor Running...");

    setInterval(async () => {
        console.log("🔍 Checking email...");

        try {
            const email = await readOneEmail();
            if (!email) {
                console.log("📭 No new email");
                return;
            }

            console.log("📩 From:", email.from);
            console.log("📝 Subject:", email.subject);

            // 1️⃣ تشخیص دسته
            const category = await detectCategory(email.text);

            // 2️⃣ تولید پاسخ AI
            const result = await analyzeLead(category, email.text);

            // 3️⃣ ذخیره در Google Sheet
            await addReplyToSheet(
                email.name || "Unknown",
                email.from,
                email.text,
                category,
                result.reply
            );

            // 4️⃣ ارسال ایمیل اتومات
            const sent = await sendAutoReply(email.from, result.reply, category);

            console.log("🧠 Category:", category);
            console.log("✉️ Email sent:", sent);
            console.log("──────────────────────────");

        } catch (err) {
            console.error("❌ Auto process error:", err);
        }
    }, interval);
}
