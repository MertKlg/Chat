import type IUser from "./interfaces/iuser";

export interface IFriend extends IUser {
    status : FriendStatus
}

export enum FriendStatus {
    Waiting = "Waiting",
    Accepted = "Accepted",
    Rejected = "Rejected",
    Unfriend = "Unfriend"
}

