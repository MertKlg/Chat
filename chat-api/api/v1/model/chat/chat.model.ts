import { execute, query } from "../../../../service/database";
import { MysqlQuery, MysqlResult } from "../mysql/mysql.interface";
import { IChat, IChatCreated, IChatId, IChatMessage, IChatSeemed, IChatUser } from "./chat.interface";
import { chatCreatedRowMapper } from "./chat.mapper";

export const getPersonalChats = async (mQuery: MysqlQuery): Promise<MysqlResult<IChat[]>> => {
    return await query({
        query: `SELECT
    u.username,
    u.user_id,
    BIN_TO_UUID(cm.chat_id) AS chat_id,
    lm.message,
    ct.chat_type
FROM
    chat_members cm
INNER JOIN
    users u ON u.user_id = cm.user_id
INNER JOIN
    chat_table ct ON cm.chat_id = ct.chat_id AND ct.chat_type = 'Personal'
LEFT JOIN
    chat_messages lm ON cm.chat_id = lm.chat_id
    AND lm.sended_at = (
        SELECT
            MAX(m2.sended_at)
        FROM
            chat_messages m2
        WHERE
            m2.chat_id = cm.chat_id
    )
WHERE
    cm.chat_id IN (
        SELECT
            chat_id
        FROM
            chat_members
        WHERE
            user_id = ?
    )
    AND cm.user_id != ?
ORDER BY
    lm.sended_at DESC;`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const getChatMessages = async (mQuery: MysqlQuery): Promise<MysqlResult<IChatMessage[]>> => {
    return await query({
        query: `SELECT
    user.user_id AS user_id,
    user.username,
    message.message,
    BIN_TO_UUID(message.chat_message_id) AS chat_message_id,
    message.sended_at,
    message.chat_image,
    BIN_TO_UUID(message.chat_id) AS chat_id,
    ct.chat_type
FROM
    chat_messages message
INNER JOIN
    users user ON message.user_id = user.user_id
INNER JOIN
    chat_table ct ON ct.chat_id = message.chat_id 
WHERE
    BIN_TO_UUID(message.chat_id) = ?
    AND message.chat_id IN (
        SELECT chat_id FROM chat_members WHERE user_id = ?
    )
    AND (? IS NULL OR message.sended_at < ?)
ORDER BY message.sended_at DESC
LIMIT ?`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const sendChatMessage = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `insert into chat_messages(message, user_id, chat_id) values(?, ?, uuid_to_bin(?))`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const getChatMembers = async (mQuery: MysqlQuery): Promise<MysqlResult<IChatUser[]>> => {
    return await query({
        query : `SELECT user_id FROM chat_members where chat_id = uuid_to_bin(?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}

export const createChat = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `INSERT INTO chat_table(chat_id,chat_type) VALUES(UUID_TO_BIN(?),?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const addChatMember = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `INSERT INTO chat_members(chat_id, user_id) VALUES(UUID_TO_BIN(?), ?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const checkChat = async (mQuery: MysqlQuery): Promise<MysqlResult<IChatCreated>> => {
    const result = await query<IChatCreated>({
        query: `select BIN_TO_UUID(chat_id) as chat_id from chat_members where user_id = ? and chat_id in (select chat_id from chat_members where user_id = ?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    }, chatCreatedRowMapper)

    return {
        data : result.data?.[0],
        error : result.error
    }
}

export const deleteChatMessage = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `delete from chat_messages where chat_id = uuid_to_bin(?) and chat_message_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const editChatMessage = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `update chat_messages set message = ? where chat_id = uuid_to_bin(?) and chat_message_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const markMessageAsSeen = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `INSERT IGNORE INTO chat_message_reads (chat_message_id, user_id, chat_id)
       VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?));`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const getMessageSeemed = async (mQuery: MysqlQuery): Promise<MysqlResult<void>> => {
    return await execute({
        query: `select id, bin_to_uuid(chat_message_id) chat_message_id, user_id, bin_to_uuid(chat_id) chat_id from chat_message_reads where chat_message_id = uuid_to_bin(?) and user_id = ? and chat_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const getSeemedMessages = async (mQuery: MysqlQuery): Promise<MysqlResult<IChatSeemed[]>> => {
    return await query({
        query: `select chat_message_reads.user_id, users.username, users.photo, seemed_at, bin_to_uuid(chat_message_reads.chat_message_id) chat_message_id from chat_message_reads
 join chat_messages on chat_messages.chat_message_id = chat_message_reads.chat_message_id
 join users on chat_message_reads.user_id = users.user_id
 where chat_message_reads.chat_id = uuid_to_bin(?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const checkOneSeemedMessage = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `select chat_message_reads.user_id, users.username, users.photo, seemed_at, bin_to_uuid(chat_message_reads.chat_message_id) chat_message_id from chat_message_reads
 join chat_messages on chat_messages.chat_message_id = chat_message_reads.chat_message_id
 join users on chat_message_reads.user_id = users.user_id
 where chat_message_reads.chat_id = uuid_to_bin(?) and chat_message_reads.chat_message_id = uuid_to_bin(?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}


export const sendChatImage = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `insert into chat_messages(chat_image,message,user_id, chat_id) values(?,?,?, uuid_to_bin(?))`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}

export const getSpecificChatId = async (mQuery : MysqlQuery) : Promise<MysqlResult<IChatId[]>> => {
    return await query({
       query : `SELECT bin_to_uuid(c.chat_id) as chat_id FROM chat_table c
       JOIN chat_members cm1 ON cm1.chat_id = c.chat_id AND cm1.user_id = ?
       JOIN chat_members cm2 ON cm2.chat_id = c.chat_id AND cm2.user_id = ?
       WHERE c.chat_type = 'Personal'`,
       params : mQuery.params,
       databasePool : mQuery.databasePool
    })
}

export const deleteChat = async(mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `delete from chat_table where chat_id = uuid_to_bin(?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}

export const deleteChatMembers = async(mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `delete from chat_members where chat_id = uuid_to_bin(?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}

export const deleteAllChatMessages = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `delete from chat_messages where chat_id = uuid_to_bin(?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}

export const deleteAllChatMessagesReads = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `delete from chat_message_reads where chat_id = uuid_to_bin(?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}