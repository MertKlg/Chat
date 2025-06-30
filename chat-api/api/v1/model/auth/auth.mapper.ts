import { RowDataPacket } from "mysql2";
import { IUser, IUserPassword } from "./auth.interface";

export const userRowMapper = (row : RowDataPacket) : IUser => {
    return {
        user_id : row.user_id,
        username : row.username,
        email : row.email,
        is_active : row.is_active,
        photo : row.photo,
        phone : row.phone
    }
}

export const userPasswordRowMapper = (row : RowDataPacket) : IUserPassword => {
    return {
        password : row.password
    }
}