import amqp from "amqplib";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();
const QUEUE_NAME = "mail_queue";
const QUEUE_RESPONSE_NAME = "mail_queue_response";
export const mailEvent = async (
  to: string,
  subject: string,
  html?: string
): Promise<any> => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL as string);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  //await channel.assertQueue(QUEUE_RESPONSE_NAME, { durable: true });
  const correlationId = randomUUID();
  const message = JSON.stringify({ to, subject, html });
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
    correlationId,
    replyTo: QUEUE_RESPONSE_NAME,
    persistent: true
  });
  // return  new Promise(async (resolve, reject) => {
  //   await channel.consume(
  //     QUEUE_RESPONSE_NAME,
  //     (msg: any) => {
  //       if (msg?.properties.correlationId === correlationId) {
  //         const response = msg.content.toString();
  //         if(response === "success"){
  //           resolve(response);
  //         }else{
  //           reject(new Error("Failed to send email"));
  //         }
  //       }
  //       channel.ack(msg);
  //     }
  //   );
  // })
};
