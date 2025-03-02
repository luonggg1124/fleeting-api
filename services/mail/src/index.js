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
const dotenv_1 = __importDefault(require("dotenv"));
const rabbitmq_consumer_1 = require("./queue/rabbitmq.consumer");
const data_source_1 = require("./config/data-source");
dotenv_1.default.config();
const app = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Mail service is starting...");
        (0, rabbitmq_consumer_1.startConsumer)();
    }
    catch (error) {
        console.log("Failed to start mail service", error);
        process.exit(1);
    }
});
data_source_1.AppDataSource.initialize().then(() => {
    app();
    console.log("Database connected!");
}).catch((error) => {
    console.log("Error: ", error);
});
