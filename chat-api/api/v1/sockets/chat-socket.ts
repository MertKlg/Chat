import { Server, Socket } from "socket.io";
import databasePool from "../../../service/database";
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error-codes";
import {
  genericProfilePhotoCompleter,
  genericStoragePhotoCompleter,
} from "../common/generic-func";
import {
  createFolderAsync,
  writeFileToFolderAsync,
} from "../../../service/file-service";
import {
  checkChat,
  createChat,
  getChatMessages,
  getChats,
  getLastChatMessage,
  sendChatMessage,
} from "./helpers/chat-query-helpers";

interface IGenericQueries {
  chat_id: string;
  users_id: string;
  message: string;
  socket: Socket;
  io: Server;
}

const chatSocket = (socket: Socket, io: Server) => {
  const { user_id } = socket.data.user;

  socket.on("join_chat_room", (data) => {
    const { chat_id } = data;
    socket.join(chat_id);
  });

  socket.on("get_chats", async () => {
    try {
      const getUserChats = await getChats(user_id);

      socket.emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: getUserChats,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("create_chat", async (data) => {
    try {
      // Want to start a chat with this user.
      const { to_user_id } = data;

      const checkChatList = await checkChat(user_id, to_user_id);
      if (checkChatList.length > 0) {
        socket.emit("create_chat_result", {
          message: "Chat already exists",
          status: 400,
        } as ResponseModel);
        return;
      }

      await createChat(user_id);

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

      const messages = await getChatMessages(user_id, chat_id);

      socket.emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: messages,
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_chat_messages_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("get_chat_messages_result", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("send_chat_message", async (data) => {
    try {
      const { chat_id, message } = data;

      const ifError = await sendChatMessage(message, user_id, chat_id);
      if (ifError) {
        socket.emit("send_chat_message_result", {
          message: "Your message could not be sent. Please try again",
          status: 400,
        } as ResponseModel);

        return;
      }

      const lastMessage = await getLastChatMessage(user_id, chat_id);

      io.to(chat_id).emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: lastMessage,
      } as ResponseModel);

      io.to(chat_id).emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: lastMessage,
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_chat_messages_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("get_chat_messages_result", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("send_chat_image", async (data) => {
    try {
      const { chat_id, images } = data;
      const imgs = images as string[];

      const fileNames = await writeFileToFolderAsync(chat_id, imgs);
      
      await new Promise((resolve, reject) => {
        if (fileNames.length > 0) {
          fileNames.map(async (e) => {
            await databasePool.query(
              "insert into chat_messages(chat_image,message,user_id, chat_id) values(?,?,?, uuid_to_bin(?))",
              [e, "Image sended", user_id, chat_id]
            );
          });
          resolve(true);
        } else {
          reject(false);
        }
      });

      const lastMessage = await getLastChatMessage(user_id, chat_id);

      io.to(chat_id).emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: lastMessage,
      } as ResponseModel);

      io.to(chat_id).emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: lastMessage,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });
};

export default chatSocket;
