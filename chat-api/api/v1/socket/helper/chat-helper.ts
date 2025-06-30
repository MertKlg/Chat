import databasePool from "../../../../service/database"
import errorMessages from "../../common/error.messages"
import { addChatMember, createChat } from "../../model/chat/chat.model"
import { IResult } from "../../model/common/common.interface"
import { v4 as uuidv4 } from 'uuid';

export const createPersonalChat = async (members: string[]): Promise<IResult<string>> => {
    const connection = await databasePool.getConnection()
    try {
        await connection.beginTransaction()

        const genChatId = uuidv4()

        const createChatResult = await createChat({ params: [genChatId, 'PERSONAL'], databasePool: connection })

        if (createChatResult.error) {
            await connection.rollback()
            return {
                error: createChatResult.error || new Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
            }
        }


        await Promise.all(
            members.map(async (member) => {
                const result = await addChatMember({ params: [genChatId, member], databasePool: connection })
                if (result.error) {
                    throw result.error
                }
                return result
            })
        )
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

