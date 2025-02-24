import { EntityManager, Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../entities/User";
import { AppDataSource } from "../../config/data-source";
import { lowercaseString, randomString } from "../../utils/string";
import { CacheClient } from "../../config/cache-client";

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
  async emailExisted(email:string):Promise<boolean>{
    return await this.exists({where: {email: email}});
  }
  async clearCache(){
    
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
    const username = `${lowercaseString(givenName)}.${lowercaseString(familyName)}`;
    if(await this.findByUserName(username)){
      return await this.createUserName(givenName, familyName);
    }
    return username;
  }
}
