import errorMessages from "../common/error.messages";
import { deleteStorageFile } from "../common/file";
import { genericFunc } from "../common/generic-func";
import { findUserById } from "../model/auth/auth.model";
import ResponseModel from "../model/error-model";
import { updateProfileModel, updateUserProfileImage } from "../model/profile/profile.model";

export const getProfile = genericFunc(async (req, res, next) => {
  res.json(new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [res.locals.user]));
});

export const updateProfile = genericFunc(async (req, res, next) => {
  const { user_id } = res.locals.user;
  const { username, email, phone } = req.body;

  const updateResult = await updateProfileModel({params : [username,email,phone,user_id]})

  if(!updateResult.data || updateResult.error){
    throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
  }
  
  res.json(new ResponseModel(errorMessages.PROFILE.UPDATED, 200));
});


export const updateProfilePhoto = genericFunc(async (req,res,next) => {
  const {user_id} = res.locals.user
  const file = req.file

  const user = await findUserById({params : user_id})

  if(!user.data || user.error){
    throw new ResponseModel(errorMessages.USER.NOT_FOUNDED, 404)
  }

  if(user.data.photo){
    const imageResult = deleteStorageFile(user.data.user_id.toString(), user.data.photo)
    if(imageResult.error){
      throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
    }
  }

  const result = await updateUserProfileImage({ params : [file?.filename, user_id] })

  if(result.error){
    throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
  }

  res.json(new ResponseModel(errorMessages.PROFILE.PROFILE_IMAGE_UPDATED, 200))
})

export const deleteProfile = genericFunc(async (req,res,next) => {
  const { user_id } = res.locals.user

  // We need better delete profile handler
  // This handler is maintenence
  //await databasePool.query(`update users set username = ?, email = '', password = '', is_active = ? where user_id = ?`, ['deleted_account', 'DEACTIVE' ,user_id])

  res.json({ message : "Profile deleted", status : 200 } as ResponseModel)
})