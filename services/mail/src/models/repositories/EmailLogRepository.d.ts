import { EntityManager, Repository } from "typeorm";
import { EmailLog } from "../entities/EmailLog";
export declare class EmailLogRepository extends Repository<EmailLog> {
    constructor(manager: EntityManager);
    logMail(data: {
        email: string;
        subject: string;
        content: string;
        status: "success" | "failed" | "pending";
        provider: string;
        errorMessage?: string;
    }): Promise<EmailLog>;
}
