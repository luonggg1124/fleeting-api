export type EmailStatus = "success" | "failed" | "pending";
export declare class EmailLog {
    id: string;
    email: string;
    subject: string;
    content: string;
    status: EmailStatus;
    errorMessage?: string;
    provider: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
