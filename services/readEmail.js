import Imap from "imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
dotenv.config();

const imapConfig = {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

export function readOneEmail() {
    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig);

        imap.once("ready", () => {
            imap.openBox("INBOX", false, (err) => {
                if (err) return reject(err);

                imap.search(["UNSEEN"], (err, results) => {
                    if (err || !results || results.length === 0) {
                        imap.end();
                        return resolve(null);
                    }

                    // ✅ آخرین ایمیل واقعی
                    const latest = results[results.length - 1];

                    const f = imap.fetch(latest, { bodies: "" });

                    f.on("message", (msg) => {
                        msg.on("body", (stream) => {
                            simpleParser(stream, (err, parsed) => {
                                if (err) return reject(err);

                                imap.addFlags(latest, "\\Seen", () => {
                                    imap.end();
                                    resolve({
                                        from: parsed.from?.value?.[0]?.address,
                                        name: parsed.from?.value?.[0]?.name,
                                        subject: parsed.subject,
                                        text: parsed.text
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        imap.once("error", reject);
        imap.connect();
    });
}
