import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const auth = new google.auth.GoogleAuth({ keyFile: "service-account.json", scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
const sheets = google.sheets({ version: "v4", auth });

router.get("/emails", async (req, res) => {
    try {
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
        console.error(err);
        res.status(500).json([]);
    }
});

export default router;
