import databasePool from "../../../service/database";
import errorCodes from "../common/error-codes";
import { genericFunc } from "../common/generic-func";
import ResponseModel from "../model/error-model";
import IUser from "../model/interface/iuser";
import path from "path"

export const getProfile = genericFunc(async (req, res, next) => {
  const { users_id } = res.locals.user;

  const user = await databasePool.query(
    "SELECT users_id,username,email,phone,photo FROM `users` where users_id = ?",
    [users_id]
  );
  if (user.length < 0) {
    throw new ResponseModel(errorCodes.USER_NOT_FOUND, 400);
  }

  const dto = user[0] as IUser[];

  if(dto[0].photo){
    dto[0].photo = `/storage/${users_id}/${dto[0].photo}`
  }else{
    dto[0].photo = `/storage/defaults/default_profile_image.png`
  }
  

  res.json(new ResponseModel(errorCodes.SUCCESS, 200, dto));
});

export const updateProfile = genericFunc(async (req, res, next) => {
  const { users_id } = res.locals.user;
  const { username, email, phone } = req.body;


  await databasePool.query(
    `update users set username = ? , email = ? , phone = ? where users_id = ?`,
    [username, email, phone ,users_id]
  );

  res.json(new ResponseModel("Profile updated", 200));
});


export const updateProfilePhoto = genericFunc(async (req,res,next) => {
  const {users_id} = res.locals.user
  const file = req.file


  const user = (await databasePool.query(
    "SELECT photo FROM `users` where users_id = ?",
    [users_id]
  ))[0] as IUser[];

  if(user[0].photo){
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../../storage', users_id.toString(), user[0].photo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await databasePool.query(
    `update users set photo = ? where users_id = ?`,
    [file?.filename ,users_id]
  );

  res.json(new ResponseModel('Profile Updated', 200))
})