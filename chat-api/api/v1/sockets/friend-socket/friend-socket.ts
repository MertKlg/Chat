import { Server, Socket } from "socket.io";
import databasePool from "../../../../service/database";
import ResponseModel from "../../model/error-model";
import IFriend from "../../model/interface/ifriend";
import errorCodes from "../../common/error-codes";
import onlineUserPool from "../pool/online-user-pool";
import { genericProfilePhotoCompleter } from "../../common/generic-func";
import { getFriendRequests, getFriends, checkFriendRequest, sendFriendRequest, searchUser, updateFriendRequest } from "../helpers/friends-query-helper";

const friendSocket = (socket: Socket, io: Server) => {
  const { user_id, username } = socket.data.user;

  socket.on("get_friends", async (data) => {
    try {

      const userFriends = await getFriends(user_id)

      socket.emit("get_friends_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: genericProfilePhotoCompleter(userFriends as any),
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
      
      const friendsRequests = await getFriendRequests(user_id)

      socket.emit("get_friend_requests_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: genericProfilePhotoCompleter(friendsRequests),
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

      await sendFriendRequest(user_id, receiver_id)

      const onlineUser = onlineUserPool.getUserSocketId(receiver_id);
      if (onlineUser)
        socket
          .to(onlineUser)
          .emit("friend_request_getted_result", {
            message: "A new friends request",
            status: 200,
            value: [{ username: username }],
          } as ResponseModel);

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


      const result  = await searchUser(user_id, username)
      console.log("result " + result)

      socket.emit("search_user_result", {
        message: "Success",
        status: 200,
        value: genericProfilePhotoCompleter(result),
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
