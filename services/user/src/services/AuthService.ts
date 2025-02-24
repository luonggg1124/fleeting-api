import { ConflictException } from "../exceptions/ConflictException";
import { UserRepository } from "../models/repositories/UserRepository";
import jwt from "jsonwebtoken";
import { randomNumberString } from "../utils/number";
import sendVerificationCodeMail from "../mail/send-verification-code";
import { CacheClient } from "../config/cache-client";
import { BadRequestException } from "../exceptions/BadRequestException";
import { QueryRunner } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Request } from "express";
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
  protected async storeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    await this.cache.setex(
      `refresh_token:${userId}`,
      refreshToken,
      7 * 24 * 60 * 60
    );
  }
  protected generateToken = (userId: string) => {
    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    return { accessToken, refreshToken };
  };
  async sendVerificationCode(req: Request):Promise<void> {
    const email = req.body.email as string;
    const userCacheKey = this.userRepository.getCacheKey();
    const existingUser = await this.userRepository.emailExisted(email);
    if (existingUser) {
      throw new ConflictException("User already exists.");
    }
    const code = randomNumberString(6);
    await this.cache.setex(`${userCacheKey.verificationCode}:${email}`, code, 60 * 5);
    sendVerificationCodeMail(code, email);
  }
  async register(req: Request) {
    const data = req.body;
    const userCacheKey = this.userRepository.getCacheKey();
    if(await this.userRepository.emailExisted(data.email)){
      throw new ConflictException("Email already exists.");
    }
    const correctVerificationCode = await this.cache.get(
      `${userCacheKey.verificationCode}:${data.email}`
    );
    if(JSON.stringify(correctVerificationCode) !== JSON.stringify(data.verificationCode)){
      throw new BadRequestException("Invalid verification code.");
    }
    const {identifiers} = await this.userRepository.insert({
      username:await this.userRepository.createUserName(data.givenName,data.familyName),
      email: data.email,
      password: await this.userRepository.hashPassword(data.password),
      isVerified: false,
      isBanned:false,
      fullName: `${data.givenName} ${data.familyName}`,
      profile:{
        givenName:data.givenName,
        familyName:data.familyName
      },
      settings: {
        allowMessages: true,
        showOnlineStatus: true,
        theme: "light"
      }
    });
    const {accessToken, refreshToken} = this.generateToken(identifiers[0].id as string);
    
  }
}
