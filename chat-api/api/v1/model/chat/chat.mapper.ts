import { RowDataPacket } from "mysql2";
import { IChatCreated } from "./chat.interface";

export const chatCreatedRowMapper = (row : RowDataPacket): IChatCreated => {
    return {
        chat_id : row.chat_id
    }
}