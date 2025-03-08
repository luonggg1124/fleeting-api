import { IProfile, ISettings, User } from "../entities/User";

export class UserDto{
    id: number;
    username:string;
    email:string;
    full_name: string;
    is_verified?:boolean;
    is_banned?: boolean;
    settings: ISettings;
    profile: IProfile;
    created_at: Date;
    updated_at: Date;
    constructor(user:User){
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.full_name = user.full_name;
        this.is_verified = user.is_verified;
        this.is_banned = user.is_banned;
        this.settings = user.settings;
        this.profile = user.profile;
        this.created_at = user.created_at;
        this.updated_at = user.updated_at;
    }
}