import dotenv from "dotenv";
import { startConsumer } from "./queue/rabbitmq.consumer";
import { AppDataSource } from "./config/data-source";
dotenv.config();
const app =async ():Promise<void> => {
    try {
        console.log("Mail service is starting...");
        startConsumer();
    } catch (error:any) {
        console.log("Failed to start mail service",error);
        process.exit(1);
    }
}

AppDataSource.initialize().then(() => {
    app();
    console.log("Database connected!");
}).catch((error) => {
    console.log("Error: ",error);
});