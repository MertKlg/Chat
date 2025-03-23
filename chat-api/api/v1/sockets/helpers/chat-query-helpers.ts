import { QueryResult } from "mysql2";
import databasePool from "../../../../service/database";
interface IChat {
    username: string;
    photo: string;
    users_id: string;
    message: string;
    chat_id: string;
}

interface IChatMessage{
    user_id : string,
    username : string,
    photo : string,
    message : string,
    chat_message_id : string,
    sended_at : string,
    chat_id : string,
    chat_image : string
}

interface ICreateChatResult{
    chat_id : string
}

interface IuuidResult {
    uuid: string;
}

export const getChats = async (user_id: string) => {
    return (
        await databasePool.query(
            `SELECT
    user.username,
    user.user_id,
    message.message,
    BIN_TO_UUID(member.chat_id) AS chat_id,
    CASE
        WHEN user.photo IS NULL THEN '/storage/defaults/default_profile_image.png'
        ELSE CONCAT('/storage/', user.user_id, '/', user.photo)
    END AS photo
FROM
    chat_members member
INNER JOIN
    users user ON user.user_id = member.user_id
LEFT JOIN
    chat_messages message ON member.chat_id = message.chat_id
    AND message.sended_at = (
        SELECT
            MAX(m2.sended_at)
        FROM
            chat_messages m2
        WHERE
            m2.chat_id = member.chat_id
    )
WHERE
    member.chat_id IN (
        SELECT
            chat_id
        FROM
            chat_members
        WHERE
            user_id = ?
    )
    AND member.user_id != ?
ORDER BY
    message.sended_at DESC;`,
            [user_id, user_id]
        )
    )[0] as IChat[];
};

export const getChatMessages = async (user_id : string,chat_id: string) => {
    return (
        await databasePool.query(
            `SELECT
    user.user_id AS user_id,
    user.username,
    message.message,
    BIN_TO_UUID(message.chat_message_id) AS chat_message_id,
    message.sended_at,
    BIN_TO_UUID(message.chat_id) AS chat_id,
    CASE
        WHEN message.chat_image IS NOT NULL THEN CONCAT('/storage/', BIN_TO_UUID(message.chat_id), '/', message.chat_image)
        ELSE NULL
    END AS chat_image,
    CASE
        WHEN user.photo IS NULL THEN '/storage/defaults/default_profile_image.png'
        ELSE CONCAT('/storage/', user.user_id, '/', user.photo)
    END AS photo
FROM
    chat_messages message
INNER JOIN
    users user ON message.user_id = user.user_id
WHERE
    BIN_TO_UUID(message.chat_id) = ?
    AND message.chat_id IN (
        SELECT
            chat_id
        FROM
            chat_members
        WHERE
            user_id = ?
    )
ORDER BY
    message.sended_at asc;`,
            [chat_id,user_id]
        )
    )[0] as IChatMessage[];
};

export const getLastChatMessage = async (user_id : string, chat_id: string) => {
    return (await databasePool.query(`
        SELECT
                user.user_id AS user_id,
                user.username,
                message.message,
                BIN_TO_UUID(message.chat_message_id) AS chat_message_id,
                message.sended_at,
                BIN_TO_UUID(message.chat_id) AS chat_id,
                CASE
        WHEN message.chat_image IS NOT NULL THEN CONCAT('/storage/', BIN_TO_UUID(message.chat_id), '/', message.chat_image)
        ELSE NULL
    END AS chat_image,
    CASE
        WHEN user.photo IS NULL THEN '/storage/defaults/default_profile_image.png'
        ELSE CONCAT('/storage/', user.user_id, '/', user.photo)
    END AS photo
            FROM
                chat_messages message
            INNER JOIN
                users user ON message.user_id = user.user_id
            WHERE
                BIN_TO_UUID(message.chat_id) = ?
                AND message.chat_id IN (
                    SELECT
                        chat_id
                    FROM
                        chat_members
                    WHERE
                        user_id = ?
                )
            ORDER BY
                message.sended_at desc limit 1`,[chat_id,user_id]))[0] as IChat[]
};

export const sendChatMessage = async (
    message: string,
    users_id: string,
    chat_id: string
) => {
    try {
        await databasePool.query(
            `insert into chat_messages(message, user_id, chat_id) values(?, ?, uuid_to_bin(?))`,
            [message, users_id, chat_id]
        );
    } catch (e) {
        if (e instanceof Error) {
            return e;
        }
    }
};

export const createChat = async (user_id: number) => {
    const uuidResult = (
        await databasePool.query("SELECT UUID() AS uuid")
    )[0] as IuuidResult[];
    const chatId = uuidResult[0].uuid;

    await databasePool.query(
        "INSERT INTO chat_table(chat_id,chat_type) VALUES(UUID_TO_BIN(?),'Personal')",
        [chatId]
    );

    await databasePool.query(
        "INSERT INTO chat_members(chat_id, user_id) VALUES(UUID_TO_BIN(?), ?)",
        [chatId, user_id]
    );

    await databasePool.query(
        "INSERT INTO chat_members(chat_id, user_id) VALUES(UUID_TO_BIN(?), ?)",
        [chatId, user_id]
    );
};


export const checkChat = async (
    user_id: number,
    to_user_id: number
) => {
    return (await databasePool.query(
        `select BIN_TO_UUID(chat_id) as chat_id from chat_members where user_id = ? and chat_id in (select chat_id from chat_members where user_id = ?)`,
        [user_id, to_user_id] 
    ))[0] as ICreateChatResult[]
}
