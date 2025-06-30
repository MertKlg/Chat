import { execute } from "../../../../service/database";
import { MysqlQuery, MysqlResult } from "../mysql/mysql.interface";

export const createGroupChat = async ( mQuery : MysqlQuery ) : Promise<MysqlResult<void>> => {
    return await execute({
        query : `insert into chat_group(chat_id, group_name, creator_user_id, photo) values(uuid_to_bin(?), ?, ?, ?)`,
        params : mQuery.params,
        databasePool : mQuery.databasePool
    })
}

