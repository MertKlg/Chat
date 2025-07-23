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

export enum FRIEND_REQUEST_RESULT {
  NEW_FRIEND_REQUEST_GOTTED = "NEW_FRIEND_REQUEST_GOTTED",
  REQUEST_SENDED = "REQUEST_SENDED",
  UNFRIEND_REQUEST_RESULT = "UNFRIEND_REQUEST_RESULT",
  ACCEPTED_FRIEND_REQUEST = "ACCEPTED_FRIEND_REQUEST",
  REJECTED_FRIEND_REQUEST = "REJECTED_FRIEND_REQUEST",
  FRIEND_REQUEST_UPDATED = "FRIEND_REQUEST_UPDATED"
}
