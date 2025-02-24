import express from "express";
import AuthController from "../../http/controllers/AuthController";
import { registerRequest, sendVerificationCodeRequest } from "../../http/requests/auth/RegisterRequest";


const authRoutes = express.Router();

authRoutes.post("/verification-code",sendVerificationCodeRequest,AuthController.sendVerificationMail);
authRoutes.post("/register",registerRequest,AuthController.register);
export default authRoutes;