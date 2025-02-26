import { Socket } from "socket.io";
import databasePool from "../../../database";
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error-codes";

interface IChatTable {
  chat_id: number;
  chat_type: string;
  created_at: Date;
}

interface IuuidResult {
  uuid: string;
}

const chatSocket = (socket: Socket) => {
  const { users_id } = socket.data.user;
  socket.on("get_chats", async () => {
    try {
      const query = await databasePool.query(
        `select user.username, user.users_id, message.message from chat_members member 
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

      const result = query[0]

      socket.emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value : result
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

      console.log(chatId);

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

      console.log("chat created !");
      socket.emit("create_chat_result", {
        message: errorCodes.SUCCESS,
        status: 200,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });
};

export default chatSocket;
