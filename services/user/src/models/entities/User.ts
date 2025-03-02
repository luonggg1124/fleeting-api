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

@Entity("users")
@Index(["email", "username"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ default: false,nullable:true })
  is_verified?: boolean;

  @Column({ default: false,nullable:true })
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
  @Column({ type: "jsonb"})
  profile: IProfile;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'follows',
    joinColumn: {name:'follower_id', referencedColumnName: "id"},
    inverseJoinColumn: {name:'following_id',referencedColumnName: "id"}
  })
  followers: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'follows',
    joinColumn: {name:'following_id', referencedColumnName: "id"},
    inverseJoinColumn: {name:'follower_id',referencedColumnName: "id"}
  })
  following: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'blocks',
    joinColumn: {name:'blocker_id', referencedColumnName: "id"},
    inverseJoinColumn: {name:'blocked_id',referencedColumnName: "id"}
  })
  blocked: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
