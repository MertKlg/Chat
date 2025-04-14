import { Server, Socket } from "socket.io";
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error-codes";
import { createGroupChat, getGroups } from "./helpers/group-chat-helpers";

const chatGroupSocket = (socket: Socket, io: Server) => {
  const { user_id } = socket.data.user;

  socket.on("get_group_chats", async () => {
    try {
      socket.emit("get_group_chats_result", {
        message : "Scc",
        value : await getGroups(user_id),
        status : 200
      }as ResponseModel)
      
    } catch (e) {
      if (e instanceof Error) {
        socket.emit("get_group_chats_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
        return;
      }

      socket.emit("get_group_chats_result", {
        message: errorCodes.SOMETHING_WENT_WRONG,
        status: 500,
      } as ResponseModel);
    }
  });

  socket.on("create_group_chat", async (data) => {
    try {
      const {group_name, members} = data

      await createGroupChat(group_name, user_id, members)

      socket.emit("create_group_chat_result", {
        message: "Group created",
        status: 200,
      } as ResponseModel);

    } catch (e) {
      if (e instanceof Error) {
        socket.emit("create_group_chat_result", {
          message: e.message,
          status: 500,
        } as ResponseModel);
      }
      socket.emit("create_group_chat_result", {
        message: "Something went wrong",
        status: 500,
      } as ResponseModel);
    }
 });
}

export default chatGroupSocket