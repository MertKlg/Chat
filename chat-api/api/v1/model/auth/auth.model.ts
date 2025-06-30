import { execute, query } from "../../../../service/database";
import { MysqlQuery, MysqlResult } from "../mysql/mysql.interface";
import { IUser, IUserPassword } from "./auth.interface";
import { userPasswordRowMapper, userRowMapper } from "./auth.mapper";

export const findUserById = async (mQuery: MysqlQuery): Promise<MysqlResult<IUser>> => {
    const result = await query<IUser>(
        { query: "SELECT user_id,username,email,photo,phone,is_active FROM users where user_id = ?", params: mQuery.params, databasePool: mQuery.databasePool },
        userRowMapper
    )

    return {
        data: result.data?.[0],
        error: result.error
    }
}

export const findUserByEmail = async (mQuery: MysqlQuery): Promise<MysqlResult<IUser>> => {
    const result = await query<IUser>(
        { query: "SELECT user_id, username,email,phone, photo, is_active from users where email = ?", params: mQuery.params, databasePool: mQuery.databasePool },
        userRowMapper
    )
    
    return {
        data: result.data?.[0],
        error: result.error
    }
}

export const findUserPasswordById = async (mQuery: MysqlQuery): Promise<MysqlResult<IUserPassword>> => {
    const result = await query<IUserPassword>({ query: "SELECT password FROM users where user_id = ?", params: mQuery.params, databasePool: mQuery.databasePool }, userPasswordRowMapper)
    return {
        data: result.data?.[0],
        error: result.error
    }
}

export const signUpUser = async (mQuery: MysqlQuery): Promise<MysqlResult<any>> => {
    return await execute({ query: "insert into users (username,email,password,phone,photo) values(?,?,?,?,?)", params: mQuery.params, databasePool: mQuery.databasePool })
}

export const updatePassword = async (mQuery: MysqlQuery): Promise<MysqlResult<any>> => {
    return await execute({ query: "UPDATE users SET password = ? where user_id = ?", params: mQuery.params, databasePool: mQuery.databasePool })
}

