import { EntityManager, Repository } from "typeorm";
import { EmailLog } from "../entities/EmailLog";

export class EmailLogRepository extends Repository<EmailLog> {
  constructor(manager: EntityManager) {
    super(EmailLog, manager);
  }
  async logMail(data: {
    email: string;
    subject: string;
    content: string;
    status: "success" | "failed" | "pending";
    provider: string;
    errorMessage?: string;
  }) {
    const emailLog = this.create(data);
    return await this.save(emailLog);
  }
}
