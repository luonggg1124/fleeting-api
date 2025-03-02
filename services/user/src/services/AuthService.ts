import { UserRepository } from "../models/repositories/UserRepository";
import jwt from "jsonwebtoken";

import sendVerificationCodeMail from "../mail/send-verification-code";
import { CacheClient } from "../config/cache-client";
import { Request } from "express";

import { UserDto } from "../models/dto/UserDto";

import { AuthenticatedRequest } from "../http/middleware/AuthMiddleware";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@fleeting/shared-exceptions";
import { randomNumberString } from "@fleeting/shared-utils";
export class AuthService {
  private userRepository: UserRepository;
  private cache;
  constructor(
    userRepository: UserRepository = new UserRepository(),

    cache: CacheClient = new CacheClient()
  ) {
    this.userRepository = userRepository;
    this.cache = cache;
  }

  private async generateToken(userId: string, deviceId: string) {
    const accessTokenExpireIns = 60 * 60;
    const refreshTokenExpireIns = 7 * 24 * 60 * 60;

    const accessToken = jwt.sign(
      { userId, deviceId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: accessTokenExpireIns,
      }
    );
    const refreshToken = jwt.sign(
      { userId, deviceId },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: refreshTokenExpireIns,
      }
    );
    try {
      await this.cache.setex(
        `refresh_token:${userId}:${deviceId}`,
        refreshToken,
        refreshTokenExpireIns
      );
    } catch (error) {
      throw error;
    }
    return { accessToken, refreshToken };
  }
  async sendVerificationCode(req: Request): Promise<void> {
    const email = req.body.email as string;
    const userCacheKey = this.userRepository.cacheKey;
    const existingUser = await this.userRepository.emailExisted(email);
    if (existingUser) {
      throw new ConflictException("User already exists.");
    }
    const code = randomNumberString(6);
    await this.cache.setex(
      `${userCacheKey.verificationCode}:${email}`,
      code,
      60 * 5
    );
    sendVerificationCodeMail(code, email);
  }
  async register(req: Request) {
    const data = req.body;
    const userCacheKey = this.userRepository.cacheKey;

    if (await this.userRepository.emailExisted(data.email)) {
      throw new ConflictException("Email already exists.");
    }
    const correctVerificationCode = await this.cache.get(
      `${userCacheKey.verificationCode}:${data.email}`
    );
    if (
      JSON.stringify(correctVerificationCode) !==
      JSON.stringify(data.verificationCode)
    ) {
      throw new BadRequestException("Invalid verification code.");
    }

    const { identifiers } = await this.userRepository.insert({
      username: await this.userRepository.createUserName(
        data.givenName,
        data.familyName
      ),
      email: data.email,
      password: await this.userRepository.hashPassword(data.password),
      is_verified: false,
      is_banned: false,
      full_name: `${data.givenName} ${data.familyName}`,
      profile: {
        given_name: data.givenName,
        family_name: data.familyName,
      },
      settings: {
        allow_messages: true,
        show_online_status: true,
        theme: "light",
      },
    });
    const deviceId = (req.body.deviceId as string) || "deviceId";
    return await this.generateToken(identifiers[0].id as string, deviceId);
  }
  async me(req: AuthenticatedRequest) {
    const user = this.userRepository.findOneBy({ id: req.userId });

    if (!user) {
      throw new NotFoundException("User not found!");
    }
    return new UserDto(user as any);
  }
}
