import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from "typeorm";

export type IProfile = {
  avatar_url?: string;
  given_name: string;
  family_name: string;
  bio?: string;
  location?: string;
  website?: string;
};
export type ISettings = {
  allow_messages: boolean;
  show_online_status: boolean;
  theme: string;
};
export type ProviderOauth = "fleeting" | "google" | "facebook" | "tiktok";
export interface IUser {
  username?: string;
  email: string;
  password?: string|null;
  full_name?: string;
  provider_oauth: ProviderOauth;
  provider_id?: string;
  is_verified?: boolean;
  is_banned?: boolean;
  settings?: ISettings;
  profile: IProfile;
  created_at?: Date;
  updated_at?: Date;
}
@Entity("users")
@Index(["email", "username"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255,nullable:true })
  password?: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ default: false, nullable: true })
  is_verified?: boolean;

  @Column({ default: false, nullable: true })
  is_banned?: boolean;

  @Column({
    type: "jsonb",
    default: {
      allow_messages: true,
      show_online_status: true,
      theme: "light",
    },
  })
  settings: ISettings;
  @Column({ type: "jsonb" })
  profile: IProfile;

  @Column({
    type: "enum",
    enum: ["fleeting", "google", "facebook", "tiktok"],
    default: "fleeting",
  })
  provider_oauth: ProviderOauth;

  @Column({ type: "varchar", unique: true, nullable: true })
  provider_id?: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: "follows",
    joinColumn: { name: "follower_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "following_id", referencedColumnName: "id" },
  })
  followers: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: "follows",
    joinColumn: { name: "following_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "follower_id", referencedColumnName: "id" },
  })
  following: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: "blocks",
    joinColumn: { name: "blocker_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "blocked_id", referencedColumnName: "id" },
  })
  blocked: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
