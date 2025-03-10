import databasePool from "../../../database";
import errorCodes from "../common/error-codes";
import { genericFunc } from "../common/generic-func";
import ResponseModel from "../model/error-model";
import IUser from "../model/interface/iuser";

export const getProfile = genericFunc(async (req, res, next) => {
  const { users_id } = res.locals.user;

  const user = await databasePool.query(
    "SELECT users_id,username,email,phone FROM `users` where users_id = ?",
    [users_id]
  );
  if (user.length < 0) {
    throw new ResponseModel(errorCodes.USER_NOT_FOUND, 400);
  }

  const dto = user[0] as IUser[];

  res.json(new ResponseModel(errorCodes.SUCCESS, 200, dto));
});

export const updateProfile = genericFunc(async (req, res, next) => {
  const { users_id } = res.locals.user;
  const { username, email, phone } = req.body;

  await databasePool.query(
    `update users set username = ? , email = ? , phone = ? where users_id = ?`,
    [username, email, phone, users_id]
  );

  res.json(new ResponseModel("Profile updated", 200));
});
