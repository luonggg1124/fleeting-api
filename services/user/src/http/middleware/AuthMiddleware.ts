import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../models/repositories/UserRepository";
import { CacheClient } from "../../config/cache-client";
dotenv.config();
class AuthMiddleware {
  private userRepository: UserRepository;
  private cache: CacheClient;
  constructor(
    userRepository: UserRepository = new UserRepository(),
    cache: CacheClient = new CacheClient()
) {
    this.userRepository = userRepository;
    this.cache = cache;
  }
  validateToken = async (req: Request, res: Response, next: NextFunction) => {
    const userCacheKey = this.userRepository.cacheKey;
    const deviceId = req.body.deviceId || 'client';
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
        const correctToken = await this.cache.get(`${userCacheKey.accessToken}:${(decoded as any).userId}:${deviceId}`);
        if(!correctToken){
            res.status(401).json({
              message: "Unauthorized - Invalid token",
            });
            return;
        }
        if(token !== correctToken){
            res.status(401).json({
              message: "Unauthorized - Invalid token",
            });
            return;
        }
        const user = await this.userRepository.findOne({
          where: { id: (decoded as any)?.userId },
        });
        if (!user) {
          res.status(401).json({
            message: "Invalid token",
          });
          return;
        }
        (req as any).user = user;
        next();
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
