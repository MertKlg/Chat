import { Socket } from "socket.io";
import databasePool from "../../../../database";
import ResponseModel from "../../model/error-model";
import IFriend from "../../model/interface/ifriend";
import IUser from "../../model/interface/iuser";
import IResponse from "../../model/interface/iresponse";
import errorCodes from "../../common/error-codes";

const friendSocket = (socket: Socket) => {
  const { users_id } = socket.data.user;

  socket.on("get_friends", async (data) => {
    try {
      const request = (
        await databasePool.query(
          "SELECT u.users_id, u.username, u.email FROM friends f LEFT JOIN users u ON (u.users_id = CASE WHEN f.sender_id = ? THEN f.receiver_id ELSE f.sender_id END)WHERE f.status = 'Accepted'  AND (f.sender_id = ? OR f.receiver_id = ?);",
          [users_id,users_id,users_id]
        )
      )[0] as IFriend[];

      socket.to(users_id).emit("get_friends_result", {message : errorCodes.SUCCESS, status : 200, value : request} as ResponseModel);
    } catch (e) {
        if(e instanceof Error){
            socket.to(users_id).emit("get_friends_result", {message : e.message, status : 500} as ResponseModel);
            return
        }
        socket.to(users_id).emit("get_friends_result", {message : "Something went wrong", status : 500} as ResponseModel);
    }
  });

  socket.on("get_friend_requests", async () => {
    try{
      const result = await databasePool.query("select u.users_id, u.username, u.email from users u inner join friends f on f.sender_id = u.users_id where f.receiver_id = ? and f.status = ?",[users_id, 'waiting'])

      socket.to(users_id).emit("get_friend_requests_result", {message : errorCodes.SUCCESS,status : 200, value : result[0] } as ResponseModel)
    }catch (e) {
      if(e instanceof Error){
          socket.to(users_id).emit("get_friend_requests_result", { message : e.message, status : 500 } as ResponseModel)
          return
      }
      socket.to(users_id).emit("get_friend_requests_result", { message : "Something went wrong", status : 500 } as ResponseModel)
  }
  })

  socket.on("friend_request", async (data) => {
    try {
      const { receiver_id } = data;

      const checkAlreadyRequestSended = (
        await databasePool.query(
          "SELECT sender_id, receiver_id, status FROM friends where sender_id = ? and receiver_id = ?",
          [users_id, receiver_id]
        )
      )[0] as IFriend[];

      if (checkAlreadyRequestSended.length > 0) {
        socket.to(users_id).emit("friend_request_result", { message : "Request already sended", status : 400 } as ResponseModel);
        return;
      }

      await databasePool.query(
        "insert into friends (sender_id, receiver_id) values (?,?)",
        [users_id, receiver_id]
      );

      socket.to(users_id).emit("friend_request_result", { message : "Request sended", status : 200 } as ResponseModel);
    } catch (e) {
        if(e instanceof Error){
            socket.to(users_id).emit("friend_request_result", { message : e.message, status : 500 } as ResponseModel)
            return
        }
        socket.to(users_id).emit("friend_request_result", { message : "Something went wrong", status : 500 } as ResponseModel)
    }
  });

  socket.on("search_friend", async (data) => {
    try {
      const { username } = data;

      if (!username) {
        socket.to(users_id).emit("search_friend_result", { message : "Username required", status : 400} as ResponseModel);
        return;
      }

      const query = `
            SELECT 
                u.users_id,
                u.username,
                u.email,
                CASE
                    WHEN f.status = 'ACCEPTED' AND (f.sender_id = ? OR f.receiver_id = ?) THEN 'friend'
                    WHEN f.status = 'WAITING' AND (f.sender_id = ? OR f.receiver_id = ?) THEN 'waiting'
                    ELSE 'not_friends'
                END AS friend_status
            FROM users u
            LEFT JOIN friends f 
                ON (u.users_id = f.sender_id OR u.users_id = f.receiver_id)
                AND (f.status IN ('ACCEPTED', 'WAITING'))
            WHERE LOWER(u.username) LIKE LOWER(?);
        `;

      const result = await databasePool.query(query, [
        users_id,
        users_id,
        users_id,
        users_id,
        `%${username}%`,
      ]);

      socket.to(users_id).emit("search_friend_result", {
        message: "Success",
        status: 200,
        value: result[0],
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.to(users_id).emit("search_friend_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.to(users_id).emit("search_friend_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on('update_friend_request', async(data) => {
    try{
      const { sender_id, status } = data
      
      await databasePool.query("update friends f set f.status = ? where receiver_id = ? and sender_id = ?", [status, users_id,sender_id ])
      
      socket.to(users_id).emit("update_friend_request_result", {message : "Success", status: 200} as ResponseModel)
    }catch(e){
      socket.to(users_id).emit("update_friend_request_result", {message : "Failed", status: 500} as ResponseModel)

    }
  })
};

export default friendSocket;
