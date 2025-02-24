import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Index,
  Column,
} from "typeorm";
import { User } from "./User";

@Entity("follows")
@Index(["followerId", "following"], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @Column()
  @Index()
  followerId: number;

  @Column()
  @Index()
  followingId: number;

  @ManyToOne(() => User, (user) => user.followers)
  follower: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}
