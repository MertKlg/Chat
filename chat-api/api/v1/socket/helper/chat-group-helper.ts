import { v4 as uuidv4 } from 'uuid';
import { createGroupChat } from "../../model/chat/chat-group-model";
import { addChatMember, createChat } from "../../model/chat/chat.model";
import databasePool from "../../../../service/database";
import { IResult } from '../../model/common/common.interface';


export const createGroupChatHelper = async (group_name : string, user_id : string, members : string[]) : Promise<IResult<string>> =>  {
    const connection = await databasePool.getConnection()
    try{
        await connection.beginTransaction()

        const genChatId = uuidv4()

        const createChatResult = await createChat({params : [genChatId,'GROUP'], databasePool : connection})

        if(createChatResult.error){
            await connection.rollback()
            return {
                error : createChatResult.error ?? new Error("Something went wrong")
            }
        }

        const createGroupChatResult = await createGroupChat({params : [genChatId,group_name,user_id, '/storage/defaults/default_group_image.png'], databasePool : connection})
        if(createGroupChatResult.error){
            await connection.rollback()
            return {
                error : createGroupChatResult.error ?? new Error("Something went wrong")
            }
        }

        await Promise.all(members.map(async(e) => {
            const res = await addChatMember({params : [genChatId,e], databasePool : connection})

            if(res.error){
                throw res.error
            }
        }))


        await connection.commit()

        return {
            data : "Group created"
        }
    }catch(e){
        await connection.rollback()
        return {
            error : e instanceof Error ? e : new Error("Something went wrong")
        }
    } finally {
        connection.release()
    }
}