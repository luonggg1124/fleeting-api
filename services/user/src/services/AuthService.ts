import { UserRepository } from "../models/repositories/UserRepository";
import jwt from "jsonwebtoken";

import sendVerificationCodeMail from "../mail/send-verification-code";

import { Request, Response } from "express";

import { UserDto } from "../models/dto/UserDto";

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  TooManyRequestException,
} from "@packages/shared-exceptions";
import { randomNumberString } from "@packages/shared-utils";
import { CacheClient } from "@packages/cache-client";
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
  async login(req: Request, res: Response) {
    const { email, password, deviceId } = req.body;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException("Email does not exist.");
    }
    const typingWrongPasswordCacheKey = `${this.userRepository.cacheKey.limitIncorrectPasswordLogin}:${email}:${deviceId}`;
    const countTyingIncorrectPassword = await this.cache.get("count_typing_incorrect_password");
    if (countTyingIncorrectPassword === 5) {
      throw new TooManyRequestException(
        "You have entered the wrong password too many times, please enter again after 5 minutes"
      );
    }
    if (await this.userRepository.comparePassword(password, user.password)) {
      if (user.is_banned) {
        throw new ForbiddenException("The account has been banned!");
      }
      const token = await this.generateToken(user.id, deviceId || "deviceId");
      res.cookie("access_token", process.env.ACCESS_TOKEN_SECRET, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: token.accessTokenExpireIns,
      });
      return {
        ...token,
        user: new UserDto(user),
      };
    } else {
      this.cache.setex(
        typingWrongPasswordCacheKey,
        countTyingIncorrectPassword ? countTyingIncorrectPassword + 1 : 1,
        5 * 60
      );
    }
  }
  private async generateToken(userId: number, deviceId: string) {
    const accessTokenExpireIns = 60 * 60;
    const refreshTokenExpireIns = 7 * 24 * 60 * 60;
    const tokenType = "bearer";
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
    return {
      accessToken,
      refreshToken,
      accessTokenExpireIns,
      refreshTokenExpireIns,
      tokenType,
    };
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
  async register(req: Request, res: Response) {
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

    const token = await this.generateToken(
      identifiers[0].id as number,
      deviceId
    );
    res.cookie("access_token", process.env.ACCESS_TOKEN_SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: token.accessTokenExpireIns,
    });
    return token;
  }
  async me(req: Request): Promise<UserDto | null> {
    const user = await this.userRepository.findOneBy({
      id: (req as any)?.userId,
    });
    if (!user) {
      throw new NotFoundException("User not found!");
    }
    const data = new UserDto(user);
    return data;
  }

  async logout(req: Request): Promise<void> {
    const userId = (req as any).userId;
    if (!userId) {
    }
  }
}
