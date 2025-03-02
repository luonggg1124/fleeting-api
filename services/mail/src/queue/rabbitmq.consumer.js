"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConsumer = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const mail_1 = require("../config/mail");
const EmailLogService_1 = require("../services/EmailLogService");
const QUEUE_NAME = "mail_queue";
const QUEUE_RESPONSE_NAME = "mail_queue_response";
const emailLogService = new EmailLogService_1.EmailLogService();
const startConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield amqplib_1.default.connect(process.env.RABBITMQ_URL);
    const channel = yield connection.createChannel();
    yield channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });
    // await channel.assertQueue(QUEUE_RESPONSE_NAME, {
    //   durable: true,
    // });
    console.log("📨 Waiting for email events...");
    channel.consume(QUEUE_NAME, (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg !== null) {
            const { to, subject, html } = JSON.parse(msg.content.toString());
            try {
                (0, mail_1.sendMail)(to, subject, html);
                // channel.sendToQueue(QUEUE_RESPONSE_NAME, Buffer.from("success"), {
                //   correlationId: msg.properties.correlationId,
                // });
                const log = emailLogService.logMail({
                    email: to,
                    subject: subject,
                    content: html,
                    status: "success",
                    provider: process.env.MAIL_MAILER,
                });
                if (!log) {
                    console.log("Cannot log mail");
                }
            }
            catch (error) {
                // channel.sendToQueue(QUEUE_RESPONSE_NAME, Buffer.from("failed"), {
                //   correlationId: msg.properties.correlationId,
                //   persistent: true,
                // });
                const log = emailLogService.logMail({
                    email: to,
                    subject: subject,
                    content: html,
                    status: "failed",
                    provider: process.env.MAIL_MAILER,
                });
                if (!log) {
                    console.log("Cannot log mail");
                }
            }
            channel.ack(msg);
        }
    }));
});
exports.startConsumer = startConsumer;
