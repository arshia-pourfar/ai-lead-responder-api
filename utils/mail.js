// // services/autoEmailProcessor.js
// import { readEmails } from "./readEmail.js";
// import { detectCategory } from "./classifier.js";
// import { analyzeLead } from "./gemini.js";
// import { addReplyToSheet } from "./googleSheet.js";
// import { sendAutoReply } from "./email.js";

// export function startAutoEmailProcessing(interval = 60000) { // هر 60 ثانیه
//     setInterval(async () => {
//         console.log("Checking new emails...");

//         const emails = await readEmails(); // فرض می‌کنیم readEmails حالا ایمیل‌ها رو برمی‌گردونه
//         for (const email of emails) {
//             const { from, subject, text } = email;

//             try {
//                 const category = await detectCategory(text);
//                 const result = await analyzeLead(category, text);

//                 await addReplyToSheet(from.name || "Unknown", from.address, text, category, result.reply);
//                 await sendAutoReply(from.address, result.reply, category);

//                 console.log(`Processed email from ${from.address}`);
//             } catch (err) {
//                 console.error("Error processing email:", err);
//             }
//         }
//     }, interval);
// }


// import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

// const GEMINI_API_URL =
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// export async function detectCategory(message) {
//     const prompt = `
// Classify the following customer message into ONE of these categories:
// - support
// - sales
// - complaint
// - general

// Message:
// "${message}"

// Only return the category name.
// `;

//     const response = await fetch(GEMINI_API_URL, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-goog-api-key": process.env.GEMINI_API_KEY
//         },
//         body: JSON.stringify({
//             contents: [{ parts: [{ text: prompt }] }]
//         })
//     });

//     const data = await response.json();
//     return (
//         data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase()
//         || "general"
//     );
// }


// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export async function sendAutoReply(email, reply, category) {
//     if (!email) return false;           // ایمیل نباشه ارسال نمیشه
//     if (process.env.AUTO_EMAIL !== "true") return false; // غیر فعال باشه هم ارسال نمیشه

//     let subject = "Thanks for contacting us";
//     if (category === "support") subject = "Support request received";
//     else if (category === "sales") subject = "Pricing & Sales inquiry";
//     else if (category === "complaint") subject = "Complaint received";

//     try {
//         await transporter.sendMail({
//             from: `"Support Team" <${process.env.EMAIL_USER}>`,
//             to: email,
//             subject,
//             text: reply,
//         });
//         return true; // ارسال موفق
//     } catch (err) {
//         console.error("Email send error:", err);
//         return false; // ارسال نشد
//     }
// }


// import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// export async function analyzeLead(category, message) {
//     const prompt = `
//   You are an AI sales assistant.
//   Category: ${category}
//   Customer message: ${message}
  
//   Write a short, friendly, professional reply that encourages the customer to continue the conversation.
//   `;

//     try {
//         const response = await fetch(GEMINI_API_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-goog-api-key": process.env.GEMINI_API_KEY
//             },
//             body: JSON.stringify({
//                 contents: [{ parts: [{ text: prompt }] }]
//             })
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error("Gemini API error:", errorText);
//             throw new Error("Gemini API failed");
//         }

//         if (!process.env.GEMINI_API_KEY) {
//             return { reply: "Thanks for reaching out! We'll reply shortly." };
//         }

//         const data = await response.json();
//         console.log("Full API response:", JSON.stringify(data, null, 2));

//         const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
//             || "Sorry, no response";

//         return { reply: text };

//     } catch (err) {
//         console.error("Gemini error details:", err);
//         return { reply: "Sorry, an error occurred while generating a reply." };
//     }
// }


// import { google } from "googleapis";
// import dotenv from "dotenv";
// dotenv.config();

// const auth = new google.auth.GoogleAuth({
//   keyFile: "service-account.json",
//   scopes: ["https://www.googleapis.com/auth/spreadsheets"]
// });

// const sheets = google.sheets({ version: "v4", auth });

// export async function addReplyToSheet(name, email, message, category, reply) {
//   if (!process.env.SPREADSHEET_ID) {
//       throw new Error("SPREADSHEET_ID is missing in .env");
//   }

//   await sheets.spreadsheets.values.append({
//     spreadsheetId: process.env.SPREADSHEET_ID,
//     range: "Sheet1!A:E",
//     valueInputOption: "RAW",
//     requestBody: {
//       values: [[name, email, message, category, reply]],
//     },
//   });
// }

// // services/readEmail.js
// import Imap from "imap";
// import { simpleParser } from "mailparser";
// import dotenv from "dotenv";
// dotenv.config();

// const imapConfig = {
//     user: process.env.EMAIL_USER,
//     password: process.env.EMAIL_PASS,
//     host: "imap.gmail.com",
//     port: 993,
//     tls: true
// };

// export function readEmails() {
//     return new Promise((resolve, reject) => {
//         const imap = new Imap(imapConfig);

//         imap.once("ready", () => {
//             imap.openBox("INBOX", true, (err, box) => {
//                 if (err) return reject(err);

//                 imap.search(["UNSEEN"], (err, results) => {
//                     if (err) return reject(err);
//                     if (!results || results.length === 0) {
//                         imap.end();
//                         return resolve([]);
//                     }

//                     const f = imap.fetch(results, { bodies: "" });
//                     const emails = [];

//                     f.on("message", (msg) => {
//                         msg.on("body", (stream) => {
//                             simpleParser(stream, (err, parsed) => {
//                                 if (!err) {
//                                     emails.push({
//                                         from: parsed.from.text,
//                                         subject: parsed.subject,
//                                         text: parsed.text
//                                     });
//                                 }
//                             });
//                         });
//                     });

//                     f.once("end", () => {
//                         imap.end();
//                         resolve(emails);
//                     });
//                 });
//             });
//         });

//         imap.once("error", (err) => reject(err));
//         imap.connect();
//     });
// }
// import express from "express";
// import { analyzeLead } from "../services/gemini.js";
// import { addReplyToSheet } from "../services/googleSheet.js";
// import { detectCategory } from "../services/classifier.js";
// import { sendAutoReply } from "../services/email.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//     let { category, message, name, email } = req.body;

//     if (!message) {
//         return res.status(400).json({ error: "message required" });
//     }
//     try {
//         // اگر دسته‌بندی نبود → خودکار تشخیص بده
//         if (!category) {
//             category = await detectCategory(message);
//         }

//         // تولید پاسخ توسط AI
//         const result = await analyzeLead(category, message);

//         // ذخیره در گوگل شیت (با مقادیر پیش‌فرض اگر خالی بود)
//         await addReplyToSheet(
//             name || "Unknown",
//             email || "N/A",
//             message,
//             category,
//             result.reply
//         );

//         // ارسال ایمیل اتومات اگر فعال بود و ایمیل موجود بود
//         const emailSent = await sendAutoReply(email, result.reply, category);

//         // پاسخ JSON نهایی
//         res.json({
//             category,
//             reply: result.reply,
//             emailSent
//         });

//     } catch (err) {
//         console.error("Route error:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// export default router;
