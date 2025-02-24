import "reflect-metadata";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/v1/auth.route";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
dotenv.config();
const PORT = process.env.PORT || 4001;
const app = express();
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
});
app.use(limiter);
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: {policy:"cross-origin"}
}));
app.use(compression({ threshold: 1024 }));
app.get('/',(req: Request, res: Response) => {
    res.json({
        message: "User Service is running."
    });
    return;
});
app.use('/auth',authRoutes);
AppDataSource.initialize().then(() => {
    console.log("Connected to postgres server");
    app.listen(PORT,() => {
        console.log("User service is running on port " +PORT);
    })
}).catch((error:any) => {
    console.error('Database connection error:', error);
});

