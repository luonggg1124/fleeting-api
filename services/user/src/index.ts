import "reflect-metadata";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import AppDataSource from "./config/data-source";
import authRoutes from "./routes/v1/auth.route";
// import helmet from "helmet";
import cookieParse from "cookie-parser";
import compression from "compression";
import session from "express-session";
import { redis } from "@packages/cache-client";
import { RedisStore } from "connect-redis";
import "./auth/google";
dotenv.config();
const PORT = process.env.PORT || 4001;
const app = express();

app.use(express.json());
app.use(cookieParse());
app.use(
  session({
    store: new RedisStore({
      client: redis,
      prefix: "session:",
      disableTouch: true
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: false, maxAge: 1000 * 60 * 30 },
  })
);



app.use(compression({ threshold: 1024 }));
app.get("/", (req: Request, res: Response) => {
  console.log(req.cookies['connect.sid']);
  
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
