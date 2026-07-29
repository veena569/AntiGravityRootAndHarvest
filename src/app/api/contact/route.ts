import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn("[CONTACT_EMAIL_WARNING] SMTP credentials are not fully configured in environment.");
      return NextResponse.json({ error: "Mailer configuration is missing" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    const subject = `New Contact Form Query from ${name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase;">Root & Harvest</h2>
        <h3 style="color: #b8903a; font-family: serif; font-style: italic;">Customer Query Received</h3>
        <p style="font-size: 14px; line-height: 1.5;">
          A new message was submitted through the Root & Harvest website contact form. Details are below:
        </p>
        <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <h4 style="color: #1e4a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px;">Message Details</h4>
        <p style="font-size: 13px; line-height: 1.6; background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px; font-style: italic; white-space: pre-wrap;">
          "${message}"
        </p>
        <div style="margin-top: 30px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center;">
          Root & Harvest Co. • Hyderabad, Telangana
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Root & Harvest Form" <${user}>`,
      to: "hello@rootandharvest.in, rootandharvestindia@gmail.com, vasu446@gmail.com",
      replyTo: email,
      subject,
      html,
    });

    console.info(`[CONTACT_FORM_SUCCESS] Query email sent from ${email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CONTACT_FORM_ERROR]", error);
    return NextResponse.json({ error: `Failed to send email. Error: ${error.message || error.toString()}` }, { status: 500 });
  }
}
