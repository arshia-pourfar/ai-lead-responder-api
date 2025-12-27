import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function detectCategory(message) {
    const prompt = `
        Classify the following customer message into ONE of these categories:
        - support
        - sales
        - complaint
        - general

        Message:
        "${message}"

        Only return the category name.
    `;

    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || "general";
}
