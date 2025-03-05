import "reflect-metadata";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import AppDataSource from "./config/data-source";
import authRoutes from "./routes/v1/auth.route";
// import helmet from "helmet";
import cookieParse from "cookie-parser";
import compression from "compression";
import session from "express-session";
import Redis from "ioredis";
import { RedisStore } from "connect-redis";


dotenv.config();
const PORT = process.env.PORT || 4001;
const app = express();

const redisClient = new Redis(process.env.REDIS_URL as string);
redisClient.connect().catch(console.error);


app.use(
  session({
    store: new RedisStore({
        client: redisClient,
        prefix: "session:",
        disableTouch: true
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 30 },
  })
);

app.use(express.json());
app.use(cookieParse());
app.use(compression({ threshold: 1024 }));
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "User Service is running.",
  });
  return;
});
app.use("/auth", authRoutes);
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to postgres server");
    app.listen(PORT, () => {
      console.log("User service is running on port " + PORT);
    });
  })
  .catch((error: any) => {
    console.error("Database connection error:", error);
  });
