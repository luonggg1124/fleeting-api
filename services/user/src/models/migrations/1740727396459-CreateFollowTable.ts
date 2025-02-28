import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFollowTable1740727396459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "follows",
        columns: [
          { name: "follower_id", type: "serial", isPrimary: true },
          { name: "following_id", type: "serial", isPrimary: true },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
            {
                columnNames: ['follower_id'],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            },
            {
                columnNames: ['following_id'],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("follows");
  }
}
