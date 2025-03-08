import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1740041764861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "username", type: "varchar", length: "100", isUnique: true },
          { name: "email", type: "varchar", length: "255", isUnique: true },
          { name: "password", type: "varchar", length: "255" },
          { name: "full_name", type: "varchar", length: "255" },
          { name: "is_verified", type: "boolean", isNullable: true },
          { name: "is_banned", type: "boolean", isNullable: true },
          { name: "settings", type: "jsonb" },
          { name: "profile", type: "jsonb" },
          {name:"provider_oauth",type:"enum",enum:["fleeting","google","facebook","tiktok"],default:"fleeting"},
          {name:"provider_oauth_id",type:"varchar",isUnique: true,isNullable:true},
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
    // B-Tree(WHERE,JOIN,ORDER BY)
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(
      `CREATE INDEX idx_users_username ON users(username)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_users_created_at_brin ON users USING BRIN(created_at)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_users_updated_at_brin ON users USING BRIN(updated_at)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "idx_users_user_name");
    await queryRunner.dropIndex("users", "idx_users_email");
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_created_at_brin`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_updated_at_brin`);
    await queryRunner.dropTable("users");
  }
}
