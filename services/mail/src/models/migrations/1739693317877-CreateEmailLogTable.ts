import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateEmailLogTable1739693317877 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "email_logs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "identity",
            default: "uuid_generate_v4()",
          },
          { name: "email", type: "varchar", isNullable: false },
          { name: "subject", type: "varchar", isNullable: false },
          { name: "content", type: "text", isNullable: false },
          {
            name: "status",
            type: "enum",
            enum: ["success", "failed", "pending"],
            default: "'pending'",
          },
          { name: "errorMessage", type: "varchar", isNullable: true },
          { name: "provider", type: "varchar", isNullable: false },
          { name: "retryCount", type: "int", default: 0 },
          { name: "metadata", type: "jsonb", isNullable: true },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
    await queryRunner.query(`CREATE INDEX idx_email ON email_logs(email)`);
    await queryRunner.query(`CREATE INDEX idx_status ON email_logs(status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("email_logs");
  }
}
