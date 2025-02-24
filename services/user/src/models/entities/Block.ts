import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("blocks")
export class Block {
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  blocker!: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  blocked!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
