import { UserRepository } from "../models/repositories/UserRepository";
import jwt from "jsonwebtoken";

import sendVerificationCodeMail from "../mail/send-verification-code";

import { Request, Response } from "express";

import { UserDto } from "../models/dto/UserDto";

import {
  BadRequestException,
  CacheException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  TooManyRequestException,
  UnauthorizedException,
} from "@packages/shared-exceptions";
import { randomNumberString } from "@packages/shared-utils";
import { CacheClient } from "@packages/cache-client";
import { IUser } from "src/models/entities/User";
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
    try {
      const { email, password, deviceId } = req.body;
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException("Email does not exist.");
      }
      const typingWrongPasswordCacheKey = `${this.userRepository.cacheKey.limitIncorrectPasswordLogin}:${email}:${deviceId}`;
      const countTyingIncorrectPassword = await this.cache.get(
        typingWrongPasswordCacheKey
      );
      if (countTyingIncorrectPassword >= 5) {
        throw new TooManyRequestException(
          "You have entered the wrong password too many times, please enter again after 5 minutes"
        );
      }
      if (await this.userRepository.comparePassword(password, user.password as string)) {
        if (user.is_banned) {
          throw new ForbiddenException("The account has been banned!");
        }
        const token = await this.generateToken(
          user.id,
          deviceId || "deviceId",
          res
        );

        return {
          ...token,
          user: new UserDto(user),
        };
      } else {
        try {
          this.cache.incr(typingWrongPasswordCacheKey);
          this.cache.expire(typingWrongPasswordCacheKey, 5 * 60);
          throw new BadRequestException("Wrong password!");
        } catch (error) {
          throw new CacheException(
            "Error caching key in login",
            typingWrongPasswordCacheKey
          );
        }
      }
    } catch (error) {
      if (error instanceof CacheException) {
        this.cache.del(error.key);
      }
      throw error;
    }
  }
  private async generateToken(userId: number, deviceId: string, res: Response) {
    const accessTokenExpireIns = 24 * 60 * 60;
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
    res.cookie(`access_token`, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: accessTokenExpireIns,
    });
    try {
      await this.cache.setex(
        `refresh_token:${userId}:${deviceId}`,
        refreshToken,
        refreshTokenExpireIns
      );
    } catch (error) {
      throw new CacheException(
        "Error caching refresh token in generateToken function",
        `refresh_token:${userId}:${deviceId}`
      );
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
    return await this.insertAndLogin(
      {
        email: data.email,
        password: data.password,
        profile: {
          given_name: data.given_name,
          family_name: data.family_name,
        },
        provider_oauth: "fleeting",
        is_verified: false,
        is_banned: false,
      },
      (req as any).deviceId || "unknown",
      res
    );
  }
  private async insertAndLogin(
    data: IUser,
    deviceId: string,
    res: Response
  ): Promise<any> {
    let password;
    if(data.password){
      password = await this.userRepository.hashPassword(data.password); 
    }
    const { identifiers } = await this.userRepository.insert({
      username: await this.userRepository.createUserName(
        data.profile.given_name,
        data.profile.family_name
      ),
      email: data.email,
      password: password,
      provider_oauth: data.provider_oauth,
      provider_id: data.provider_id,
      is_verified: data.is_verified,
      is_banned: data.is_banned,
      full_name: `${data.profile.given_name} ${data.profile.family_name}`,
      profile: {
        given_name: data.profile.given_name,
        family_name: data.profile.family_name,
      },
      settings: {
        allow_messages: true,
        show_online_status: true,
        theme: "light",
      },
    });
    return await this.generateToken(identifiers[0].id as number, deviceId, res);
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

  async logout(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.userId;
    if (!userId) {
      throw new UnauthorizedException("Unauthorized!");
    }
    this.cache.del(
      `refresh_token:${userId}:${req.body.deviceId || "deviceId"}`
    );
    res.clearCookie("access_token");
    return;
  }

  async loginGoogle(req: Request, res: Response): Promise<any> {
    const {profile,deviceId} = req.user as any;
    if (!profile) throw new NotFoundException("User not found!");
    const data = profile._json as any;
    const user = await this.userRepository.findByProviderId(data.sub);
    
    if(user){
      if(user.provider_oauth !== "google" || user.email !== data.email){
        throw new ConflictException("The account could not login by google.");
      }
      return await this.generateToken(user.id,deviceId,res);
    }
    return await this.insertAndLogin({
      email: data.email,
      provider_oauth: "google",
      provider_id: data.sub,
      password: null,
      profile: {
        given_name:data.given_name,
        family_name:data.family_name,
      }
    },deviceId,res);
  }
}
