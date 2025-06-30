import { IUser } from "../auth/auth.interface";
import FriendStatus from "../types/friend-status"

interface IBaseFriend {
    friends_id : number
}
//type FriendStatus = "ACCEPTED" | "WAITING" | "NOT_FRIENDS";

export interface IFriend extends IBaseFriend, IUser{}

export interface ICheckFriend {
    sender_id : string,
    receiver_id : string,
    status : FriendStatus
}

export interface IFriendRequest extends IUser{}

export interface ISearchFriend extends IUser {
  status : FriendStatus
}

