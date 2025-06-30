import databasePool from "../../../../service/database"
import { updateFriendRequest } from "../../model/friend/friend.model"
import FriendStatus from "../../model/types/friend-status"
import ResponseModel from "../../model/error-model"
import errorMessages from "../../common/error.messages"
import { deleteAllChatMessages, deleteAllChatMessagesReads, deleteChat, deleteChatMembers, getChatMembers, getSpecificChatId } from "../../model/chat/chat.model"
import { IResult } from "../../model/common/common.interface"

export const unFriendHelper = async (status: FriendStatus, userId: number, friendId: number): Promise<IResult<string>> => {
    const connection = await databasePool.getConnection()
    try {
        await connection.beginTransaction()

        const getChatId = await getSpecificChatId({ params: [userId, friendId], databasePool: connection })

        if (getChatId.error) {
            await connection.rollback()
            return {
                error: getChatId.error || new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
            }
        }

        if (!getChatId.data || getChatId.data.length <= 0) {
            const updateResult = await updateFriendRequest({ params: [status, userId, friendId,friendId,userId], databasePool: connection })
            if (updateResult.error) {
                await connection.rollback()
                return {
                    error: updateResult.error || new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
                }
            }

            await connection.commit()

            return {
                data: errorMessages.GENERAL.SUCCESS
            }
        } else {
            const results = await Promise.all([
                deleteAllChatMessagesReads({ params: [getChatId.data[0].chat_id], databasePool: connection }),
                deleteAllChatMessages({ params: [getChatId.data[0].chat_id], databasePool: connection }),
                deleteChatMembers({ params: [getChatId.data[0].chat_id], databasePool: connection }),
                deleteChat({ params: [getChatId.data[0].chat_id], databasePool: connection }),
                updateFriendRequest({ params: [status, userId, friendId,friendId,userId], databasePool: connection })
            ])

            for (const result of results) {
                if (result.error) {
                    await connection.rollback()
                    throw result.error
                }
            }
        }

        await connection.commit()

        return {
            data: errorMessages.GENERAL.SUCCESS
        }
    } catch (e) {
        await connection.rollback()

        if (e instanceof Error) {
            return {
                error: e
            }
        }
        return {
            error: new Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
        }

    } finally {
        connection.release()
    }
}