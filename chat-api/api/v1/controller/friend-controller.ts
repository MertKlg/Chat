import databasePool from "../../../database";
import errorCodes from "../common/error-codes";
import { genericFunc } from "../common/generic-func";
import ResponseModel from "../model/error-model";
import IFriend from "../model/interface/ifriend";
import IMessage from "../model/interface/IMessage";
import IUser from "../model/interface/iuser";
import FriendStatus from "../model/types/friend-status";

export const getFriendRequests = genericFunc(async (req, res, next) => {
  const { user_id, username } = res.locals.user;
  const query = (
    await databasePool.query(
      `SELECT friends_id, friend_status, users.username, users.email, users.user_id from friends join users on users.user_id = friends.user_id where friends.user_id = ?;`,
      [user_id]
    )
  )[0] as IFriend[];

  res.json(new ResponseModel(errorCodes.SUCCESS, 200, query));
});


export const myRequests = genericFunc(async (req, res, next) => {
    const {user_id} = res.locals.user
    const query = (await databasePool.query(`
        SELECT 
  friends.friends_id, 
  friends.friend_status, 
  users.username 
FROM 
  friends 
JOIN 
  users ON users.user_id = friends.user_id  
WHERE 
  friends.sender_id = ? 
  AND friends.friend_status = '${FriendStatus.Waiting}';
`, [user_id]))

const dto = query[0] as IFriend[]

res.json(new ResponseModel(errorCodes.SUCCESS, 200, dto))
})


export const sendFriendRequest = genericFunc(async (req, res, next) => {
  const { toUser } = req.body;

  const validateSendableUser = (
    await databasePool.query(
      "SELECT `user_id` FROM users WHERE user_id = ?",
      toUser
    )
  )[0] as IUser[];

  if (validateSendableUser.length < 0)
    throw new ResponseModel(errorCodes.USER_NOT_FOUND, 400);

  const checkAlreadySended = await databasePool.query(
    "SELECT `user_id` From friends WHERE user_id = ?",
    validateSendableUser[0].user_id
  );

  if (checkAlreadySended.length > 0)
    throw new ResponseModel("Request already sended", 400);

  const { user_id } = res.locals.user;

  await databasePool.query(
    "INSERT INTO `friends` (`sender_id`, `user_id`) VALUES (?,?)",
    [user_id, validateSendableUser[0].user_id]
  );

  res.json(new ResponseModel("Request sended", 200));
});

export const updateFriendRequest = genericFunc(async (req, res, next) => {
  const { user_id } = res.locals.user;
  const { friends_id, status } = req.body;

  if(!Object.values(FriendStatus).includes(status))
    throw new ResponseModel("Invalid status", 400)

  await databasePool.query("UPDATE `friends` SET `friend_status`= ? WHERE friends_id = ? and user_id = ?", [status,friends_id, user_id])

  res.json(new ResponseModel("Request updated", 200));
});


