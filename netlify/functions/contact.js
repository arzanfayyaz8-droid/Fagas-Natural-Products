// netlify/functions/contact.js
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "All fields are required" }),
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 1️⃣ Send email to admin
    await transporter.sendMail({
      from: email,
      to: process.env.GMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    // 2️⃣ Send confirmation email to visitor
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Thank you for contacting Fagas Natural Products!",
      text: `Hi ${name},\n\nThank you for reaching out! We have received your message:\n"${message}"\n\nWe will get back to you as soon as possible.\n\nBest regards,\nFagas Natural Products`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Message sent successfully!" }),
    };

  } catch (error) {
    console.error("Email send error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Error sending message" }),
    };
  }
};
