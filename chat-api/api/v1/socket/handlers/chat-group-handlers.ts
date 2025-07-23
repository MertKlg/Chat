import { Socket } from "socket.io";
import errorCodes from "../../common/error.messages";
import { createGroupChatHelper, deleteGroupChatHelper } from "../../helper/chat-group-helper";
import ResponseModel from "../../model/error-model";
import errorMessages from "../../common/error.messages";
import { getGroupByGroupId, getGroupChats, leaveGroupChat } from "../../model/chat/chat-group-model";
import { getSocketInstanse } from "../socket-instanse";

export const getGroupChatHandler = async (data: any, socket: Socket) => {
    const { user_id } = socket.data.user

    const getGroups = await getGroupChats({ params: [user_id] })
    if (getGroups.error) {
        socket.emit("get_group_chats_result", new ResponseModel(getGroups.error.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500));
        return
    }

    socket.emit("get_group_chats_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, getGroups.data));
};

export const createGroupChatHandler = async (data: any, socket: Socket) => {
    const { group_name, members } = data
    const { user_id } = socket.data.user

    const result = await createGroupChatHelper(group_name, user_id, members)

    if (result.error) {
        socket.emit("create_group_chat_result", new ResponseModel(result.error.message || errorCodes.GENERAL.SOMETHING_WENT_WRONG, 500))
        return
    }

    socket.emit("create_group_chat_result", new ResponseModel(errorCodes.GENERAL.SUCCESS, 200))
}


export const leaveGroupChatHandler = async (data: any, socket: Socket) => {
    const { chat_id, group_id } = data
    const { user_id } = socket.data.user
    const io = getSocketInstanse()
    const getGroupChat = await getGroupByGroupId({ params: [group_id] })
    // If user creator
    if (getGroupChat.data && getGroupChat.data.author_id == user_id) {
        // Delete group_chat
        const helperResult = await deleteGroupChatHelper(chat_id, group_id)

        console.log(helperResult)

        if (helperResult.error) {
            socket.emit("leave_chat_group_result", new ResponseModel(helperResult.error.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500))
            return
        }
    } else {
        // Leave group_chat
        const result = await leaveGroupChat({ params: [user_id, chat_id] })

        if (result.error) {
            socket.emit("leave_chat_group_result", new ResponseModel(result.error.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500))
            return
        }
    }


    io.to(chat_id).emit("leave_chat_group_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200))
}
