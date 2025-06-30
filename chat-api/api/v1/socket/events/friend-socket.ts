import { Socket } from "socket.io";
import ResponseModel from "../../model/error-model";
import FriendStatus from "../../model/types/friend-status";
import {
  acceptFriendHandler,
  friendRequestHandler,
  getFriendRequestHandler,
  getFriendsHandler,
  rejectFriendHandler,
  searchUserHandler,
  unfriendHandler,
} from "../handlers/friends-handler";

const friendSocket = (socket: Socket) => {

  socket.on("get_friends", async (data) => getFriendsHandler(data, socket));

  socket.on("get_friend_requests", async () =>
    getFriendRequestHandler(undefined, socket)
  );

  socket.on("friend_request", async (data) =>
    friendRequestHandler(data, socket)
  );

  socket.on("search_user", async (data) => searchUserHandler(data, socket));

  socket.on("update_friend_request", async (data) => {

    const { friend_status_type } = data;

    switch (friend_status_type) {
      case FriendStatus.Accepted:
        await acceptFriendHandler(data, socket)
        break;

      case FriendStatus.Rejected:
        await rejectFriendHandler(data, socket)
        break;

      case FriendStatus.Unfriend:
        await unfriendHandler(data, socket)
      break

      case FriendStatus.Waiting:
      break;

      default:
        socket.emit("update_friend_request_result", new ResponseModel("Invalid friend status type", 400));
        break;
    }
  });
};

export default friendSocket;
