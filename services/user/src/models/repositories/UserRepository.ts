import { EntityManager, Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../entities/User";
import { AppDataSource } from "../../config/data-source";
import { lowercaseString, randomString } from "../../utils/string";
import { CacheClient } from "../../config/cache-client";
import { randomNumberString } from "../../utils/number";

interface CacheKey {
  emailExisted: string;
  verificationCode: string;
}
export class UserRepository extends Repository<User> {
  public manager:EntityManager;
  private cache:CacheClient;
  private cacheKey:CacheKey;
  constructor(
    manager: EntityManager = AppDataSource.manager,
    cache: CacheClient = new CacheClient()
  ) {
    super(User, manager);
    this.cache = cache;
    this.cacheKey = {
      emailExisted: "email_existed",
      verificationCode: "verification_code"
    }
  }
  async emailExisted(email:string):Promise<boolean>{
    const cache = await this.cache.get(`${this.cacheKey.emailExisted}:${email}`);
    if(cache){
      return true;
    }

    const db = await this.exists({where: {email: email}});
    if(db){
      this.cache.setex(`${this.cacheKey.emailExisted}:${email}`,db,60*60);
    }
    return db;
  }
  getCacheKey(){
    return this.cacheKey;
  }
  async findByEmail(email:string): Promise<User | null> {
    return this.findOne({where:{email} });
  }
  async findByUserName(username:string): Promise<User|null>{
    return this.findOne({where: {username}});
  }
  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }
  async comparePassword(password:string, hash:string): Promise<boolean>{
    return await bcrypt.compare(password, hash);
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
