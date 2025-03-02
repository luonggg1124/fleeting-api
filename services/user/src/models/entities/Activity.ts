import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("activity_logs")
export class UserActivityLog {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  action: string;

  @Column()
  ip_address: string;

  @Column()
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}
