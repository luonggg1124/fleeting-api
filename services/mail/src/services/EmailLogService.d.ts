import { EmailLogRepository } from "../models/repositories/EmailLogRepository";
export declare class EmailLogService {
    private emailLogRepository;
    constructor(emailLogRepository?: EmailLogRepository);
    logMail: (data: {
        email: string;
        subject: string;
        content: string;
        status: "success" | "failed" | "pending";
        provider: string;
        errorMessage?: string;
    }) => Promise<import("../models/entities/EmailLog").EmailLog>;
}
