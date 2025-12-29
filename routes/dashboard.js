import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// 🔹 تابع کمکی برای اتصال به Google Sheets
function getSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "service-account.json",
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    return google.sheets({ version: "v4", auth });
}

/**
 * GET /dashboard/emails
 * لیست ایمیل‌ها
 */
router.get("/emails", async (req, res) => {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Sheet1!A:E"
        });

        const rows = response.data.values || [];
        const emails = rows.map((row, idx) => ({
            id: idx + 1,
            name: row[0],
            email: row[1],
            message: row[2],
            category: row[3],
            reply: row[4] || "",
            replied: !!row[4]
        }));

        res.json(emails);
    } catch (err) {
        console.error("Error fetching emails:", err);
        res.status(500).json([]);
    }
});

/**
 * GET /dashboard/responses
 * وضعیت پاسخ‌ها
 */
router.get("/responses", async (req, res) => {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Sheet1!A:E"
        });

        const rows = response.data.values || [];
        const responses = rows.map((row, idx) => ({
            id: idx + 1,
            to: row[1],
            subject: row[2],
            reply: row[4] || "",
            status: row[4] ? "Sent" : "Pending",
            time: row[5] || ""
        }));

        res.json(responses);
    } catch (err) {
        console.error("Error fetching responses:", err);
        res.status(500).json([]);
    }
});

/**
 * GET /dashboard/analytics
 * آنالیز تعداد ایمیل‌ها بر اساس دسته و sentiment
 */
router.get("/analytics", async (req, res) => {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Sheet1!A:E"
        });

        const rows = response.data.values || [];
        const categories = {};
        const sentiment = { positive: 0, negative: 0, neutral: 0 };

        rows.forEach(row => {
            const cat = row[3] || "general";
            categories[cat] = (categories[cat] || 0) + 1;

            const s = row[5] || "neutral";
            if (s === "positive") sentiment.positive += 1;
            else if (s === "negative") sentiment.negative += 1;
            else sentiment.neutral += 1;
        });

        res.json({ categories, sentiment });
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).json({ categories: {}, sentiment: { positive: 0, negative: 0, neutral: 0 } });
    }
});

/**
 * GET /dashboard/sheets
 * نمایش کامل Google Sheets
 */
router.get("/sheets", async (req, res) => {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Sheet1!A:F"
        });

        const rows = response.data.values || [];
        const entries = rows.map((row, idx) => ({
            id: idx + 1,
            date: row[0],
            sender: row[1],
            subject: row[2],
            message: row[3],
            response: row[4],
            status: row[5] || "Pending"
        }));

        res.json(entries);
    } catch (err) {
        console.error("Error fetching sheets:", err);
        res.status(500).json([]);
    }
});

export default router;
