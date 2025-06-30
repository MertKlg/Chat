import { execute, query } from "../../../../service/database";
import { MysqlQuery, MysqlResult } from "../mysql/mysql.interface";

export const updateProfileModel = async(mQuery : MysqlQuery) : Promise<MysqlResult<any>> => {
    return await execute({ query: "UPDATE users set username = ? , email = ? , phone = ? WHERE user_id = ?" ,params : mQuery.params, databasePool : mQuery.databasePool })
}

export const updateUserProfileImage = async(mQuery : MysqlQuery) : Promise<MysqlResult<any>> => {
    return await execute({ query: "UPDATE users set photo = ? WHERE user_id = ?" ,params : mQuery.params, databasePool : mQuery.databasePool })
}