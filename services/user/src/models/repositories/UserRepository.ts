import { EntityManager, Repository } from "typeorm";
import { User } from "../entities/User";
import AppDataSource from "../../config/data-source";
import { CacheClient } from "@packages/cache-client";
import { lowercaseString, randomNumberString, randomString } from "@packages/shared-utils";
import argon2 from "argon2";


export class UserRepository extends Repository<User> {
  public manager:EntityManager;
  private cache:CacheClient;
 
  constructor(
    manager: EntityManager = AppDataSource.manager,
    cache: CacheClient = new CacheClient()
  ) {
    super(User, manager);
    this.cache = cache;
  }
  get cacheKey(){
    return {
      emailExisted: "email_existed",
      verificationCode: "verification_code",
      limitIncorrectPasswordLogin: "limit_incorrect_password_login"
    }
  }
  async emailExisted(email:string):Promise<boolean>{
   
    if(await this.cache.get(`${this.cacheKey.emailExisted}:${email}`)){
      return true;
    }
    const db = await this.exists({where: {email: email}});
    if(db){
      this.cache.setex(`${this.cacheKey.emailExisted}:${email}`,db,60*60);
    }
    return db;
  }
 
  async findByEmail(email:string): Promise<User | null> {
    return this.findOne({where:{email} });
  }
  async findByProviderId(id:string): Promise<User|null>{
    return this.findOne({where:{provider_id:id}});
  }
  async findByUserName(username:string): Promise<User|null>{
    return this.findOne({where: {username}});
  }
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password,{
      type: argon2.argon2id,
      memoryCost:16384,
      timeCost: 2,
      parallelism: 2
    });
  }
  async comparePassword(password:string, hash:string): Promise<boolean>{
    return await argon2.verify(hash,password);
  }
  async createUserName(givenName?:string, familyName?:string): Promise<string>{
    if(!givenName){
      givenName = randomString(Math.floor(Math.random() * 10));
    }
    if(!familyName){
      familyName = randomString(Math.floor(Math.random() * 10));
    }
    const username = `${lowercaseString(givenName)}${lowercaseString(familyName)}.${randomNumberString(Math.random() * 10)}`;
    if(await this.exists({where:{username} })){
      return await this.createUserName(givenName, familyName);
    }
    return username;
  }
}
