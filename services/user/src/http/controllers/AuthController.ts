import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService";
import { ConflictException } from "../../exceptions/ConflictException";

// arrowFunction luôn giữ this của class.
// normalFunction bị mất this khi gọi trực tiếp.

class AuthController {
  private authService: AuthService;
  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      
      const result = await this.authService.register(req);
      res.json({
        user : result
      });
      return;
    } catch (error: any) {
      
      if(error?.message){
        res.status(500).json({
          message: error.message
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
}

export default new AuthController();
