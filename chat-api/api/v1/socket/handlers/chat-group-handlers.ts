import { Socket } from "socket.io";
import errorCodes from "../../common/error.messages";
import IResponse from "../../model/interface/iresponse";
import { createGroupChatHelper } from "../helper/chat-group-helper";
import ResponseModel from "../../model/error-model";

export const getGroupChatHandler = async (data: any, socket: Socket) => {
    try {
        const { user_id } = socket.data.user



        socket.emit("get_group_chats_result", {
            message: errorCodes.GENERAL.SUCCESS,
            //value: await getGroups(user_id),
            status: 200,
        } as IResponse);

    } catch (e) {
        if (e instanceof Error) {
            socket.emit("get_group_chats_result", {
                message: e.message,
                status: 500,
            } as IResponse);
            return;
        }

        socket.emit("get_group_chats_result", {
            message: errorCodes.GENERAL.SOMETHING_WENT_WRONG,
            status: 500,
        } as IResponse);
    }
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
