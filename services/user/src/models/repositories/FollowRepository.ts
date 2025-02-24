import { EntityManager, Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Follow } from "../entities/Follow";
export class UserFollowerRepository extends Repository<Follow> {
  public manager:EntityManager;
  constructor(manager: EntityManager = AppDataSource.manager) {
    super(Follow, manager);
  }
  
}
