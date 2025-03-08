import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  TooManyRequestException,
} from "@packages/shared-exceptions";

class AuthController {
  private authService: AuthService;
  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }
  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req,res);
      res.json({ ...result });
      return;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof ForbiddenException) {
        res.status(403).json({ message: error.message });
        return;
      }
      if(error instanceof TooManyRequestException){
        res.status(429).json({ message: error.message });
        return;
      }
      if(error instanceof BadRequestException){
        res.status(400).json({
          message: error.message,
        });
        return;
      }
      res.status(500).json({ message: "Internal Server Error",error: error.message,stack: error.stack });
      return;
    }
  };
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req,res);
      res.json({
        user: result,
      });
      return;
    } catch (error: any) {
      if (error?.message) {
        res.status(500).json({
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        message: "Internal Server Error.",
      });
      return;
    }
  };
  sendVerificationMail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          message: "Email is required",
        });
        return;
      }
      await this.authService.sendVerificationCode(req);
      res.json({
        message: "Verification code already sent to your mail.",
      });
      return;
    } catch (error: any) {
      if (error instanceof ConflictException) {
        res.status(error.getStatus() as number).json({
          message: error.message,
        });
        return;
      }
      if (error?.message) {
        res.status(500).json({
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        message: "Internal Server Error",
      });
      return;
    }
  };
  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.me(req);
      res.json({
        user: user,
      });
      return;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        message: "Internal Server Error.",
      });
      return;
    }
  };
  logout = async(req:Request,res:Response):Promise<void> => {
    try {
        this.authService.logout(req,res);
        res.status(201).json({
          message: "Logged out successfully!"
        });
        return;
    } catch (error:any) {
      console.log(error?.stack);
      res.status(500).json({
        message: "Internal Server Error.",
      }); 
      return;
    }
  }
  loginGoogle = async (req:Request,res:Response):Promise<void> => {
    try {
      const result = await this.authService.loginGoogle(req,res);
      res.json({...result });
      return;
    } catch (error) {
      console.log(error);
      
      res.status(500).json({
        message: "Internal Server Error.",
        error
      });
      return;
    }
  }
}

export default new AuthController();
