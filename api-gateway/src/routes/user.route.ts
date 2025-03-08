import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
dotenv.config();
const router:Router = Router();

router.use(
    "/",
    createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true,
    })
);

export default router;