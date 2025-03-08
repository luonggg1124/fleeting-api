import { Entity, Column, CreateDateColumn, Index, UpdateDateColumn, ObjectIdColumn } from "typeorm";

export type EmailStatus = "success" | "failed" | "pending";

@Entity({
    name: "email_logs"
})
export class EmailLog {
    @ObjectIdColumn()
    id: string;

    @Index()
    @Column({length: 255})
    email:string;

    @Column()
    subject:string;

    @Column("text")
    content: string;

    @Index()
    @Column({
        type: "enum",
        enum: ["success","failed","pending"], 
        default: "pending"
    })
    status:EmailStatus;

    @Column({ nullable: true })
    errorMessage?:string;

    @Column()
    provider: string;


    @Column("jsonb", { nullable: true }) 
    metadata?: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}