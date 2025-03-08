import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { CacheClient } from "@packages/cache-client";
dotenv.config();
export interface AuthenticatedRequest extends Request {
  userId?: any;
}
class AuthMiddleware {
  private cache: CacheClient;
  constructor(
    cache: CacheClient = new CacheClient()
) {
    this.cache = cache;
  }
  validateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) {
        
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET || ("" as string)
        );
        const access_token = req.cookies[`access_token`];
        if(access_token !== token){
          res.status(401).json({
            message: "Unauthorized, token is invalid",
          });
          return;
        }
        req.userId = (decoded as any).userId;
      } catch (error: any) {
        if (error.name === "TokenExpiredError") {
          res.status(401).json({
            message: "Unauthorized - Access token expired",
          });
          return;
        }
        throw error;
      }
      next();
    } catch (error) {
      res.status(401).json({
        message: "Unauthorized, token is invalid",
      });
      return;
    }
  };
}

export default new AuthMiddleware();
