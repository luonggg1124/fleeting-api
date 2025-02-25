import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,

} from "typeorm";
import { Follow } from "./Follow";
import { Block } from "./Block";

@Index(["email","username"],{unique:true})
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column({ length: 100,unique: true })
  username: string;

  @Column({ length: 255, unique:true })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 255})
  fullName: string;

  @Column({ default: false })
  isVerified?: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: "jsonb", nullable:true, default: {
    allowMessages: true,
    showOnlineStatus: true,
    theme: "light"
  } })
  settings: {
    allowMessages: boolean;
    showOnlineStatus: boolean;
    theme: string;
  }
  @Column({type:"jsonb", nullable:true})
  profile: {
    avatarUrl?:string;
    givenName:string;
    familyName:string;
    bio?:string;
    location?: string;
    website?:string;
  }

  @OneToMany(() => Follow, (follow) => follow.follower)
  followers: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  following: Follow[];

  @OneToMany(() => Block, (block) => block.blocked)
  blocked: Block[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
