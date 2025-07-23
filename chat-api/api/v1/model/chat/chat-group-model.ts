import { execute, query } from "../../../../service/database";
import { MysqlQuery, MysqlResult } from "../mysql/mysql.interface";
import { IChatGroup } from "./chat.interface";

export const createGroupChat = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `insert into chat_group(chat_id, group_name, creator_user_id, photo) values(uuid_to_bin(?), ?, ?, ?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const getGroupChats = async (mQuery: MysqlQuery): Promise<MysqlResult<IChatGroup[]>> => {
    return await query({
        query: `SELECT 
    BIN_TO_UUID(g.group_id) AS group_id, 
    BIN_TO_UUID(g.chat_id) AS chat_id, 
    g.group_name, 
    u.user_id as author_id,
    u.username AS author_name, 
    u.photo AS author_photo, 
    u.email AS author_email, 
    g.created_at,
    ct.chat_type
FROM chat_group g
INNER JOIN users u ON u.user_id = g.creator_user_id
inner join chat_table ct on ct.chat_id = g.chat_id
INNER JOIN chat_members cm ON cm.chat_id = g.chat_id
WHERE cm.user_id = ?
`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const leaveGroupChat = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `delete from chat_members where user_id = ? and chat_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })


}

export const getGroupByGroupId = async (mQuery: MysqlQuery): Promise<MysqlResult<IChatGroup>> => {
    const res = await query<IChatGroup>({
        query: `SELECT 
bin_to_uuid(group_id) as group_id,
bin_to_uuid(chat_id) as chat_id,
group_name,
creator_user_id as author_id,
created_at,
photo
FROM chat_group where group_id = uuid_to_bin(?);`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })

    return {
        data: res.data?.[0],
        error: res.error
    }
}

export const deleteGroupChatByGroupId = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query: `delete from chat_group where group_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const deleteGroupChatByChatId = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query: `delete from chat_group where chat_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const getOwnedGroups = async (mQuery : MysqlQuery) : Promise<MysqlResult<IChatGroup[]>> => {
    return await query({
        params :mQuery.params,
        query : `select 
bin_to_uuid(group_id) as group_id, 
bin_to_uuid(chat_id) as chat_id,
creator_user_id,
group_name,
created_at,
photo
from chat_group where creator_user_id = ?`,
        databasePool : mQuery.databasePool
    })
}