import { Server, Socket } from "socket.io";
import databasePool from "../../../database";
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error-codes";
import onlineChatPool from "./pool/online-chat-pool";

interface IChatTable {
  chat_id: number;
  chat_type: string;
  created_at: Date;
}

interface IMessages{
  username : string,
  chat_message_id : string,
  message : string,
  user_id : number,
  sended_at : string
}

interface IuuidResult {
  uuid: string;
}

const chatSocket = (socket: Socket, io : Server) => {
  const { users_id,username } = socket.data.user;

  socket.on("join_chat_room", (data) => {
    const {chat_id} = data
    socket.join(chat_id)
  })

  socket.on("get_chats", async () => {
    try {
      const query = await databasePool.query(
        `select user.username, user.users_id, message.message, BIN_TO_UUID(member.chat_id) as chat_id from chat_members member 
inner join users user on user.users_id = member.user_id 
LEFT JOIN chat_messages message 
    ON member.chat_id = message.chat_id 
    AND message.sended_at = ( 
        SELECT MAX(m2.sended_at) 
        FROM chat_messages m2 
        WHERE m2.chat_id = member.chat_id
    ) 
WHERE member.chat_id IN (
    SELECT chat_id FROM chat_members WHERE user_id = ?
) 
AND member.user_id != ?
ORDER BY message.sended_at DESC;`,
        [users_id, users_id]
      ); 
      
      const result = query[0];

      socket.emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: result,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("create_chat", async (data) => {
    try {
      // Want to start a chat with this user.
      const { user_id } = data;

      const uuidResult = (
        await databasePool.query("SELECT UUID() AS uuid")
      )[0] as IuuidResult[];
      const chatId = uuidResult[0].uuid;

      await databasePool.query(
        "INSERT INTO chat_table(chat_id,chat_type) VALUES(UUID_TO_BIN(?),'Personal')",
        [chatId]
      );

      await databasePool.query(
        "INSERT INTO chat_members(chat_id, user_id) VALUES(UUID_TO_BIN(?), ?)",
        [chatId, users_id]
      );

      await databasePool.query(
        "INSERT INTO chat_members(chat_id, user_id) VALUES(UUID_TO_BIN(?), ?)",
        [chatId, user_id]
      );

      socket.emit("create_chat_result", {
        message: errorCodes.SUCCESS,
        status: 200,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("get_chat_messages", async (data) => {
    try {
      const { chat_id } = data;

      const databaseQuery = await databasePool.query(
        `SELECT user.username,message.message,message.user_id, message.sended_at, BIN_TO_UUID(message.chat_message_id) as chat_message_id
FROM chat_messages message inner join users user on user.users_id = message.user_id
WHERE chat_id = UUID_TO_BIN(?) order by message.sended_at ASC
`,
        [chat_id]
      );

      socket.emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: databaseQuery[0],
      } as ResponseModel)

    } catch (e) {
      if(e instanceof Error){
        socket.emit("get_chat_messages_result", {
          message: e.message,
          status: 500,
        } as ResponseModel)
        return
      }
      socket.emit("get_chat_messages_result", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel)

    }
  });

  socket.on("send_chat_message", async(data) => {
    try{
      const { chat_id,message } = data
      
      

      await databasePool.query(`insert into chat_messages(message, user_id, chat_id) values(?, ?, uuid_to_bin(?))`, [message,users_id,chat_id])

      const query = await databasePool.query(`select user.users_id as user_id,user.username, message.message, message.chat_message_id, message.sended_at, bin_to_uuid(message.chat_id) as chat_id from chat_messages message inner join users user on message.user_id = user.users_id where user_id = ? and bin_to_uuid(chat_id) = ? ORDER BY message.sended_at DESC limit 1`,[users_id, chat_id]);
      socket.emit("send_chat_message_result", {
        message: errorCodes.SUCCESS,
        status: 200,
      } as ResponseModel)
      
      io.to(chat_id).emit("get_chat_messages_result",{message: errorCodes.SUCCESS, status : 200, value : query[0] } as ResponseModel)

      const lastMessageQuery = await databasePool.query(`SELECT
    user.username,
    user.users_id,
    message.message,
    BIN_TO_UUID(member.chat_id) AS chat_id
FROM
    chat_members member
INNER JOIN
    users user ON user.users_id = member.user_id
LEFT JOIN
    chat_messages message
        ON member.chat_id = message.chat_id
        AND message.sended_at = (
            SELECT MAX(m2.sended_at)
            FROM chat_messages m2
            WHERE m2.chat_id = member.chat_id
        )
WHERE
    member.chat_id = UUID_TO_BIN(?)
ORDER BY
    message.sended_at DESC LIMIT 1`, [chat_id, users_id])

      
      io.to(chat_id).emit("get_chats_result", {message: errorCodes.SUCCESS, status : 200, value : lastMessageQuery[0] } as ResponseModel)
    }catch(e){
      if(e instanceof Error){
        socket.emit("get_chat_messages_result", {
          message: e.message,
          status: 500,
        } as ResponseModel)
        return
      }
      socket.emit("get_chat_messages_result", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel)
    }
  })
};

export default chatSocket;
