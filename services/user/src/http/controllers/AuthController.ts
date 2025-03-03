import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@fleeting/shared-exceptions";

// arrowFunction luôn giữ this của class.
// normalFunction bị mất this khi gọi trực tiếp.

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
      res.status(500).json({ message: "Internal Server Error" });
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
      
    } catch (error:any) {
      
    }
  }
}

export default new AuthController();
