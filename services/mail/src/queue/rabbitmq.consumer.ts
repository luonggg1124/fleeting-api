import amqp from "amqplib";
import { sendMail } from "../config/mail";
import { EmailLogService } from "../services/EmailLogService";

const QUEUE_NAME = "mail_queue";
const QUEUE_RESPONSE_NAME = "mail_queue_response";
const emailLogService = new EmailLogService();
export const startConsumer = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
  });
  // await channel.assertQueue(QUEUE_RESPONSE_NAME, {
  //   durable: true,
  // });
  console.log("📨 Waiting for email events...");
  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const { to, subject, html } = JSON.parse(msg.content.toString());
      try {
        sendMail(to, subject, html);
        // channel.sendToQueue(QUEUE_RESPONSE_NAME, Buffer.from("success"), {
        //   correlationId: msg.properties.correlationId,
        // });
        const log = emailLogService.logMail({
          email: to,
          subject: subject,
          content: html,
          status: "success",
          provider: process.env.MAIL_MAILER as string,
        });
        if (!log) {
          console.log("Cannot log mail");
        }
      } catch (error: any) {
        // channel.sendToQueue(QUEUE_RESPONSE_NAME, Buffer.from("failed"), {
        //   correlationId: msg.properties.correlationId,
        //   persistent: true,
        // });
        const log = emailLogService.logMail({
          email: to,
          subject: subject,
          content: html,
          status: "failed",
          provider: process.env.MAIL_MAILER as string,
        });
        if (!log) {
          console.log("Cannot log mail");
        }
      }
      channel.ack(msg);
    }
  });
};
