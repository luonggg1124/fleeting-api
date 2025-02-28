import { ConflictException } from "../exceptions/ConflictException";
import { UserRepository } from "../models/repositories/UserRepository";
import jwt from "jsonwebtoken";
import { randomNumberString } from "../utils/number";
import sendVerificationCodeMail from "../mail/send-verification-code";
import { CacheClient } from "../config/cache-client";
import { BadRequestException } from "../exceptions/BadRequestException";
import { QueryRunner } from "typeorm";
import AppDataSource from "../config/data-source";
import { Request } from "express";
import { NotFoundException } from "../exceptions/NotFoundException";
import { UserDto } from "../models/dto/UserDto";
export class AuthService {
  private userRepository: UserRepository;
  private cache;
  private queryRunner: QueryRunner;
  constructor(
    userRepository: UserRepository = new UserRepository(),

    cache: CacheClient = new CacheClient(),
    queryRunner: QueryRunner = AppDataSource.createQueryRunner()
  ) {
    this.userRepository = userRepository;
    this.cache = cache;
    this.queryRunner = queryRunner;
  }

  private async generateToken(
    userId: string,
    deviceId: string,
    accessData = {
      key: "access_token",
      expiresIn: 15 * 60,
    },
    refreshData = {
      key: "refresh_token",
      expiresIn: 7 * 24 * 60 * 60,
    }
  ) {
    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: accessData.expiresIn,
      }
    );
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    await Promise.all([
      this.cache.setex(
        `${accessData.key}:${userId}:${deviceId}`,
        accessToken,
        accessData.expiresIn
      ),
      this.cache.setex(
        `${refreshData.key}:${userId}:${deviceId}`,
        refreshToken,
        refreshData.expiresIn
      ),
    ]);
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
    // const correctVerificationCode = await this.cache.get(
    //   `${userCacheKey.verificationCode}:${data.email}`
    // );
    // if (
    //   JSON.stringify(correctVerificationCode) !==
    //   JSON.stringify(data.verificationCode)
    // ) {
    //   throw new BadRequestException("Invalid verification code.");
    // }

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
    const deviceId = req.body.deviceId as string;
    return await this.generateToken(
      identifiers[0].id as string,
      deviceId,
      {
        key: userCacheKey.accessToken,
        expiresIn: 15 * 60,
      },
      {
        key: userCacheKey.refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      }
    );
  }
  async me(req: Request) {
    const user = (req as any).user;
    if (!user) {
      throw new NotFoundException("User not found!");
    }
    return new UserDto(user);
  }
}
