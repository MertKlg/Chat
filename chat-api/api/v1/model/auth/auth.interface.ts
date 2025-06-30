import ProfileStatus from "../types/profile-status";

interface BaseUser {
    user_id : number,
}

export interface IUser extends BaseUser{
    username : string,
    email : string,
    phone : string,
    photo? : string,
    is_active : ProfileStatus
}

export interface IUserPassword {
    password? : string
}