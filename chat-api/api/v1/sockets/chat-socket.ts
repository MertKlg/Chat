import { Server, Socket } from "socket.io";
import databasePool from "../../../service/database";
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error-codes";
import { writeFileToFolderAsync } from "../../../service/file-service";
import {
  checkChat,
  checkOneSeemedMessage,
  createChat,
  deleteChatMessage,
  editChatMessage,
  getChatMembers,
  getChatMessages,
  getChats,
  getMessageSeemed,
  getSeemedMessages,
  markMessageAsSeen,
  sendChatMessage,
} from "./helpers/chat-query-helpers";

const chatSocket = (socket: Socket, io: Server) => {
  const { user_id } = socket.data.user;

  socket.on("join_chat_room", (data) => {
    const { chat_id } = data;
    socket.join(chat_id);
  });

  socket.on("leave_chat_room", (data) => {
    const { chat_id } = data;
    socket.leave(chat_id);
  });

  socket.on("get_chats", async () => {
    try {
      const getChat = await getChats(user_id);

      socket.emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: getChat,
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_chats_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }

      socket.emit("get_chats_result", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel);
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

      await createChat(user_id, to_user_id);

      socket.emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: await getChats(user_id),
      } as ResponseModel);
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("create_chat_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
      }
      socket.emit("create_chat_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("get_chat_messages", async (data) => {
    try {
      const { chat_id } = data;

      const messages = await getChatMessages(user_id, chat_id);

      if (messages.length > 0) {
        await Promise.all(
          messages
            .filter((e) => e.user_id != user_id)
            .map((e) => markMessageAsSeen(e.chat_message_id, user_id, chat_id))
        );
      }

      const seemedMessages = await getSeemedMessages(chat_id)

      socket.emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: messages,
      } as ResponseModel);


      io.to(chat_id).emit("messages_seemed_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: seemedMessages,
      })


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

      const lastMessage = await getChatMessages(user_id, chat_id, undefined, 1);

      io.to(chat_id).emit("get_last_chat_message", {
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
        socket.emit("get_last_chat_message", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("get_last_chat_message", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("send_chat_image", async (data) => {
    try {
      const { chat_id, images } = data;

      const getMembers = await getChatMembers(chat_id);

      if (getMembers.length <= 0) {
        socket.emit("send_chat_message_result", {
          message: "Chat not founded",
          status: 400,
        } as ResponseModel);
        return;
      }

      const imgs = images as string[];

      const fileNames = await writeFileToFolderAsync(chat_id, imgs);

      await Promise.all(
        fileNames.map(async (e) => {
          await databasePool.query(
            "insert into chat_messages(chat_image,message,user_id, chat_id) values(?,?,?, uuid_to_bin(?))",
            [e, "Image", user_id, chat_id]
          );
        })
      );

      const lastMessage = await getChatMessages(user_id, chat_id,undefined,1);

      const userIds = getMembers.map((e) => e.user_id);

      io.to(chat_id).emit("get_last_chat_message", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: lastMessage,
      } as ResponseModel);

      io.to(userIds).emit("get_chats_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: lastMessage,
      } as ResponseModel);

      socket.emit("send_chat_image_result", {
        message: errorCodes.SUCCESS,
        status: 200,
      } as ResponseModel);

    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_last_chat_message", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }
      socket.emit("get_last_chat_message", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("edit_chat_message", async (data) => {
    try {
      const { chat_message_id, chat_id } = data;

      await editChatMessage(chat_id, chat_message_id, data.message);

      io.to(chat_id).emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: await getChatMessages(user_id, chat_id),
      } as ResponseModel);

      socket.emit("edit_chat_message_result", {
        message: "Message updated",
        status: 200,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("delete_chat_message", async (data) => {
    try {
      const { chat_message_id, chat_id } = data;

      await deleteChatMessage(chat_id, chat_message_id);

      io.to(chat_id).emit("get_chat_messages_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: await getChatMessages(user_id, chat_id),
      } as ResponseModel);

      socket.emit("delete_chat_message_result", {
        message: "Message deleted",
        status: 200,
      } as ResponseModel);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("message_seen", async(data) => {
    try{
      const { chat_message_id, chat_id} = data

      const lastMessage = await getChatMessages(user_id, chat_id, undefined, 1 )

      console.log(lastMessage[lastMessage.length - 1].user_id == user_id)

      if(lastMessage[lastMessage.length - 1].user_id == user_id){
        return;
      }
      await markMessageAsSeen(chat_message_id, user_id, chat_id)

      io.to(chat_id).emit("messages_seemed_result", {
        message: errorCodes.SUCCESS,
        status: 200,
        value: await checkOneSeemedMessage(chat_id, chat_message_id),
      } as ResponseModel);

    }catch(e){
      console.error(e)
    }
  })
};

export default chatSocket;
