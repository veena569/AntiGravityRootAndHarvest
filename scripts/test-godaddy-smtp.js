const nodemailer = require("nodemailer");

async function testGoDaddySmtp(host, port, secure) {
  console.log(`Testing host=${host}, port=${port}, secure=${secure}...`);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: "hello@rootandharvest.in",
      pass: "Anaira@2019"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.verify();
    console.log(`SUCCESS with host=${host}, port=${port}! Sending test email...`);
    const info = await transporter.sendMail({
      from: '"Root & Harvest" <hello@rootandharvest.in>',
      to: "rootandharvestindia@gmail.com, vasu446@gmail.com",
      subject: "Test Order Notification - Root & Harvest",
      text: "This is a test notification to verify order email delivery via GoDaddy SMTP."
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
    return true;
  } catch (err) {
    console.error(`FAILED with host=${host}, port=${port}:`, err.message);
    return false;
  }
}

async function run() {
  // Test common GoDaddy / Workspace SMTP configurations
  if (await testGoDaddySmtp("smtpout.secureserver.net", 465, true)) return;
  if (await testGoDaddySmtp("smtpout.secureserver.net", 587, false)) return;
  if (await testGoDaddySmtp("smtpout.secureserver.net", 80, false)) return;
  if (await testGoDaddySmtp("smtp.secureserver.net", 465, true)) return;
  if (await testGoDaddySmtp("smtp.secureserver.net", 587, false)) return;
  if (await testGoDaddySmtp("smtp.office365.com", 587, false)) return;
}

run();
