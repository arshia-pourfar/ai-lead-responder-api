import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function analyzeLead(category, message) {
    const prompt = `
  You are an AI sales assistant.
  Category: ${category}
  Customer message: ${message}
  
  Write a professional and friendly reply.
  `;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API error:", errorText);
            throw new Error("Gemini API failed");
        }

        const data = await response.json();
        console.log("Full API response:", JSON.stringify(data, null, 2));

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
            || "Sorry, no response";

        return { reply: text };

    } catch (err) {
        console.error("Gemini error details:", err);
        return { reply: "Sorry, an error occurred while generating a reply." };
    }
}
