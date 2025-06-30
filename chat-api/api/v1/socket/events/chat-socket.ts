import { Socket } from "socket.io";
import ResponseModel from "../../model/error-model";
import { createChatHandler, deleteChatMessageHandler, editChatMessageHandler, getChatMessageHandler, getChatsHandler, messageSeemedHandler, sendImageMessageHandler, sendTextMessageHandler } from "../handlers/chat-handlers";
import { MessageType } from "../../model/chat/chat.enum";

const chatSocket = (socket: Socket) => {

  socket.on("join_chat_room", (data) => {
    const { chat_id } = data;
    socket.join(chat_id);
  });

  socket.on("leave_chat_room", (data) => {
    const { chat_id } = data;
    socket.leave(chat_id);
  });

  socket.on("get_chats", async () => getChatsHandler(undefined, socket));

  socket.on("create_chat", async (data) => createChatHandler(data, socket));

  socket.on("get_chat_messages", async (data) => getChatMessageHandler(data, socket));

  socket.on("send_chat_message", async (data) => {
    const { message_type } = data

    switch(message_type) {
      case MessageType.text : 
         await sendTextMessageHandler(data, socket)
      break;

      case MessageType.image : 
         await sendImageMessageHandler(data,socket)
      break;

      case MessageType.edit :
        await editChatMessageHandler(data, socket)
      break;

      case MessageType.delete : 
         await deleteChatMessageHandler(data, socket)
      break;

      default : 
          socket.emit("send_chat_message_result", new ResponseModel("Invalid message type", 400))
      break;
    }
  });


  socket.on("message_seen", async(data) => messageSeemedHandler(data,socket))
};

export default chatSocket;
