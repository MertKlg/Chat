import { Server, Socket } from "socket.io";
import databasePool from "../../../../service/database";
import ResponseModel from "../../model/error-model";
import IFriend from "../../model/interface/ifriend";
import errorCodes from "../../common/error-codes";
import onlineUserPool from "../pool/online-user-pool";
import { genericProfilePhotoCompleter } from "../../common/generic-func";
import { getFriendRequests, getFriends, checkFriendRequest, sendFriendRequest, searchUser, updateFriendRequest } from "../helpers/friends-query-helper";
import FriendStatus from "../../model/types/friend-status";
import { findUser } from "../helpers/user-query-helpers";
import IResponse from "../../model/interface/iresponse";

const friendSocket = (socket: Socket, io: Server) => {
  const { user_id,username } = socket.data.user;

  socket.on("get_friends", async (data) => {
    try {
      socket.emit("get_friends_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: await getFriends(user_id),
      } as ResponseModel);

    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_friends_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("get_friends_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("get_friend_requests", async () => {
    try {
      socket.emit("get_friend_requests_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: await getFriendRequests(user_id),
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_friend_requests_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("get_friend_requests_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("friend_request", async (data) => {
    try {
      const { receiver_id } = data;

      const checkAlreadyRequestSended = await checkFriendRequest(user_id, receiver_id)

      if (checkAlreadyRequestSended.length > 0) {
        socket.emit("friend_request_result", {
          message: "Request already sended",
          status: 400,
        } as ResponseModel);
        return;
      }

      console.log(receiver_id)

      await sendFriendRequest(user_id, receiver_id)

      socket.to(receiver_id)
      .emit("notification_channel", { message : `${username ?? "A user"} sent you a friend request`, status : 200 } as ResponseModel)

      socket.emit("friend_request_result", {
        message: "Request sended",
        status: 200,
      } as ResponseModel);

    } catch (e) {
      if (e instanceof Error) {
        socket.emit("friend_request_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("friend_request_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("search_user", async (data) => {
    try {
      const { username } = data;

      if (!username) {
        socket.emit("search_friend_result", {
          message: "Username required",
          status: 400,
        } as ResponseModel);
        return;
      }

      socket.emit("search_user_result", {
        message: "Success",
        status: 200,
        value: await searchUser(user_id, username),
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("search_user_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("search_user_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("update_friend_request", async (data) => {
    try {
      const { sender_id, status } = data;
      await updateFriendRequest(user_id, sender_id, status)
      const user = await findUser(user_id)

      console.log(status as string)

      if((status as string).toLowerCase().trim() == FriendStatus.Accepted.toLowerCase().trim()){
        socket.to(sender_id)
        .emit("notification_channel", {
          message : `${user[0].username ?? "A user"} accepted your friend request`,
          status : 200
        } as IResponse)

        

      }


      socket.emit("update_friend_request_result", {
        message: "Success",
        status: 200,
      } as ResponseModel);
    } catch (e) {
      socket.emit("update_friend_request_result", {
        message: "Failed",
        status: 500,
      } as ResponseModel);
    }
  });
};

export default friendSocket;
