import databasePool from "../../../../service/database";
import IGroupChat from "../../model/interface/igroup-chat";
import IUser from "../../model/interface/iuser";
import IuuidResult from "../../model/interface/iuuid-result";

export const createGroupChat = async (groupName : string, user_id : string, members : IUser[]) => {

    const uuidResult = (
        await databasePool.query("SELECT UUID() AS uuid")
    )[0] as IuuidResult[];
    const chatId = uuidResult[0].uuid;

    await databasePool.query(
        "INSERT INTO chat_table(chat_id,chat_type) VALUES(UUID_TO_BIN(?),'GROUP')",
        [chatId]
    );

    await databasePool.query(
        `INSERT INTO chat_group (group_id, chat_id, group_name, creator_user_id, created_at)
         VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?, ?, NOW());`,
         [chatId, groupName,user_id]
    )

    const membersId = members.map(e => e.user_id)
    membersId.push(user_id)

    for(const memberId of membersId){
        await databasePool.query(
            "INSERT INTO chat_members (chat_id, user_id) VALUES (UUID_TO_BIN(?), ?)",
            [chatId, memberId]
        );
    }
}


export const getGroups = async (user_id: string) => {
    const getConnection = await databasePool.getConnection();
    
    await getConnection.beginTransaction();
  
    const groupMessages = (await databasePool.query(
      `SELECT
  bin_to_uuid(cg.group_id) AS group_id,
  cg.group_name,
  cg.created_at,
  bin_to_uuid(ct.chat_id) AS chat_id,
  cg.photo AS photo,
  (
    SELECT cmes.message
    FROM chat_messages cmes
    WHERE cmes.chat_id = ct.chat_id
    ORDER BY cmes.sended_at DESC
    LIMIT 1
  ) AS message
FROM
  chat_members cm
JOIN
  chat_group cg ON cm.chat_id = cg.chat_id
JOIN
  chat_table ct ON cg.chat_id = ct.chat_id
WHERE
  cm.user_id = ?
  AND ct.chat_type = 'Group'
`,[user_id]
    ))[0] as IGroupChat[];
  
    await getConnection.commit();
  
    return groupMessages
};
  