const nodemailer = require("nodemailer");

async function test() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "hello@rootandharvest.in",
      pass: "Anaira@2019"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified successfully!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: '"Root & Harvest" <hello@rootandharvest.in>',
      to: "rootandharvestindia@gmail.com, vasu446@gmail.com",
      subject: "Test Order Notification - Root & Harvest",
      text: "This is a test notification to verify order email delivery."
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (err) {
    console.error("SMTP ERROR:", err.message);
    if (err.response) {
      console.error("SMTP Server Response:", err.response);
    }
  }
}

test();
