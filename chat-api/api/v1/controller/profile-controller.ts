import { writeFileToFolderAsync } from "../../../service/file-service";
import errorMessages from "../common/error.messages";
import { deleteStorageFile, deleteStorageFileAsync } from "../common/file";
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

  const updateResult = await updateProfileModel({ params: [username, email, phone, user_id] })

  if (updateResult.error) {
    throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
  }

  res.json(new ResponseModel(errorMessages.PROFILE.UPDATED, 200));
});


export const updateProfilePhoto = genericFunc(async (req, res, next) => {
  const { user_id, photo } = res.locals.user
  const file = req.file

  if (!file) {
    res.json(new ResponseModel(errorMessages.PROFILE.PROFILE_IMAGE_MISSING, 200))
    return
  }
  
  if (photo) {
    const imageResult = await deleteStorageFileAsync(photo)
    if (imageResult.error) {
      console.log("Delete image has a error : ", imageResult.error)
      throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
    }
  }
  const result = await updateUserProfileImage({ params: [`/storage/${user_id}/${file.filename}`, user_id] })

  if (result.error) {
    console.log("Update profile image has a error : ", result.error)
    throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
  }

  res.json(new ResponseModel(errorMessages.PROFILE.PROFILE_IMAGE_UPDATED, 200))
})