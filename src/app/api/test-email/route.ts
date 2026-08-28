import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = process.env.SMTP_HOST || "smtpout.secureserver.net";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "hello@rootandharvest.in";
  const pass = process.env.SMTP_PASS || "Anaira@2019";

  const results: any = {
    config: { host, port, user, passMasked: pass ? "CONFIGURED" : "MISSING" },
    steps: []
  };

  try {
    results.steps.push("Creating transporter...");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000, // 5s timeout
      greetingTimeout: 5000,
    });

    results.steps.push("Verifying connection...");
    await transporter.verify();
    results.steps.push("Verification successful! Sending test email...");

    const info = await transporter.sendMail({
      from: `"Root & Harvest Admin Test" <${user}>`,
      to: "rootandharvestindia@gmail.com, vasu446@gmail.com",
      subject: "Test Diagnostic Email - Root & Harvest",
      text: "This is a diagnostic email sent from the Vercel production environment."
    });

    results.steps.push("Email sent successfully!");
    results.messageId = info.messageId;
    results.success = true;
  } catch (err: any) {
    results.success = false;
    results.error = err.message || err;
    if (err.stack) results.stack = err.stack;
    if (err.code) results.code = err.code;
    if (err.response) results.response = err.response;
  }

  return NextResponse.json(results);
}
