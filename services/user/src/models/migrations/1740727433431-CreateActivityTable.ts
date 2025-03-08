import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateActivityTable1740727433431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "activity_logs",
        columns: [
          { name: "id", type: "serial", isUnique: true },
          { name: "user_id", type: "serial" },
          { name: "ip_address", type: "text" },
          { name: "user_agent", type: "text" },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("activities");
  }
}
