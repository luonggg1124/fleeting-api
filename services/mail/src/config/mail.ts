import nodemailer, { TransportOptions } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT || 587,
  service: process.env.MAIL_SERVICE || "gmail.com",
  auth: {
    user: process.env.MAIL_USERNAME || "example@example.com",
    pass: process.env.MAIL_PASSWORD || "password",
  },
} as TransportOptions);
export const sendMail = async (
  to: string,
  subject: string,
  html?: string
): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USERNAME || "example@example.com",
      to,
      subject,
      html,
    });
    console.log("Sent mail: " + info.messageId);
  } catch (error: any) {
    console.log("Error:", error);
  }
};
