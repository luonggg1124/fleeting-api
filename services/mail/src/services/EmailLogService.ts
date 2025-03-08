import { AppDataSource } from "../config/data-source";
import { EmailLogRepository } from "../models/repositories/EmailLogRepository";



export class EmailLogService {
    private emailLogRepository: EmailLogRepository;
    constructor(emailLogRepository: EmailLogRepository = new EmailLogRepository(AppDataSource.manager)) {
        this.emailLogRepository = emailLogRepository;
    }

    logMail = async (data:{
        email: string,
        subject:string,
        content: string,
        status: "success" | "failed" | "pending",
        provider: string,
        errorMessage?:string
    }) => {
        const mail = await this.emailLogRepository.logMail(data);
        return mail;
    }
}