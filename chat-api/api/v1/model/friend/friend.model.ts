import { execute, query } from "../../../../service/database";
import { MysqlQuery, MysqlResult } from "../mysql/mysql.interface";
import { ICheckFriend, IFriend, IFriendRequest } from "./friend.interface";

export const getFriends = async (mQuery: MysqlQuery): Promise<MysqlResult<IFriend[]>> => {
    return await query({
        query: `SELECT f.friends_id,u.user_id, u.username, u.email, u.photo, u.is_active
        FROM friends f LEFT JOIN users u ON (u.user_id = CASE WHEN f.sender_id = ? THEN f.receiver_id ELSE f.sender_id END)
        WHERE f.status = 'Accepted'  
        AND (f.sender_id = ? OR f.receiver_id = ?)`, params: mQuery.params, databasePool: mQuery.databasePool
    })
}


export const getFriendRequest = async (mQuery: MysqlQuery): Promise<MysqlResult<IFriendRequest[]>> => {
    return await query({
        query: "select u.user_id, u.username, u.email, u.photo from users u inner join friends f on f.sender_id = u.user_id where f.receiver_id = ? and f.status = 'waiting'",
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}


export const checkFriendRequest = async (mQuery: MysqlQuery): Promise<MysqlResult<ICheckFriend[]>> => {
    return await query({
        query: `SELECT sender_id, receiver_id, status
FROM friends
WHERE 
  (
    (sender_id = ? AND receiver_id = ?)
    OR
    (sender_id = ? AND receiver_id = ?)
  )`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const sendFriendRequest = async (mQuery: MysqlQuery): Promise<MysqlResult<any>> => {
    return await execute({
        query: "insert into friends (sender_id, receiver_id) values (?,?)",
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const searchFriend = async (mQuery: MysqlQuery): Promise<MysqlResult<any>> => {
    return await query({
        query: `SELECT DISTINCT
    u.user_id,
    u.username,
    u.email
FROM users u
LEFT JOIN friends f 
    ON (
        (u.user_id = f.sender_id AND f.receiver_id = ?)
        OR
        (u.user_id = f.receiver_id AND f.sender_id = ?)
    )
WHERE
    (
        f.status IS NULL
        OR f.status NOT IN ('ACCEPTED', 'WAITING')
    )
    AND LOWER(u.username) LIKE CONCAT('%', LOWER(?), '%')
    AND u.user_id != ?`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const updateFriendRequest = async (mQuery: MysqlQuery): Promise<MysqlResult<any>> => {
    return await execute({
        query: `UPDATE friends f 
SET f.status = ?
WHERE (receiver_id = ? AND sender_id = ?)
   OR (receiver_id = ? AND sender_id = ?)`,
        params: mQuery.params,
        databasePool: mQuery.databasePool
    })
}

export const deleteFriendRequest = async (mQuery : MysqlQuery) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `
        DELETE from friends f 
WHERE (receiver_id = ? AND sender_id = ?)
   OR (receiver_id = ? AND sender_id = ?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}