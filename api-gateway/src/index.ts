import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import router from "./routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
});

app.use(limiter);

app.use("/api",router);

app.use("/",(req: express.Request, res: express.Response) => {
    res.json({
        message: "Api gateway is running"
    });
    return;
})

app.listen(PORT, () => {
    console.log(`Api gateway is running on port ${PORT}`);
})