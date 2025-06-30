import errorMessages from "../common/error.messages";
import { genericFunc } from "../common/generic-func";
import { findUserById } from "../model/auth/auth.model";
import ResponseModel from "../model/error-model";


export const verifyUser = genericFunc(async (req,res,next) => {
    const { user_id } = res.locals.user

    if(!user_id)
        throw new ResponseModel(errorMessages.USER.NOT_FOUNDED, 404)

    const user = await findUserById(user_id)
    
    if(!user.data || user.error)
        throw new ResponseModel(errorMessages.USER.NOT_FOUNDED, 404)

    res.locals.user = user.data
    next()
})