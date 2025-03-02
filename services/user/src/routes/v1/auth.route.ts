import express, { Router } from "express";
import AuthController from "../../http/controllers/AuthController";
import { registerRequest, sendVerificationCodeRequest } from "../../http/requests/auth/RegisterRequest";
import AuthMiddleware from "../../http/middleware/AuthMiddleware";
import { loginRequest } from "../../http/requests/auth/LoginRequest";




const authRoutes:Router = express.Router();

authRoutes.post("/login",loginRequest,AuthController.login);
authRoutes.post("/verification-code",sendVerificationCodeRequest,AuthController.sendVerificationMail);
authRoutes.post("/register",registerRequest,AuthController.register);
authRoutes.get("/me",AuthMiddleware.validateToken,AuthController.me);
export default authRoutes;