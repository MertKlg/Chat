import ErrorMessages from "../common/error.messages";
import { genericFunc } from "../common/generic-func";
import ResponseModel from "../model/error-model";
import { DeviceTypes } from "../model/types/device-types";
import ProfileStatus from "../model/types/profile-status";
import { findUserByEmail, findUserById, findUserPasswordById, signUpUser, updatePassword } from "../model/auth/auth.model";
import { compare, hash } from "../common/hash.pass";
import errorMessages from "../common/error.messages";
import { generateToken } from "../common/jwt";
import { IUser } from "../model/auth/auth.interface";

export const signUp = genericFunc(async (req, res, next) => {
    const { username, email, password, phone } = req.body

    const findUser = await findUserByEmail({ params: [email] })

    if(findUser.data){
        throw new ResponseModel(ErrorMessages.EMAIL.ALREADY_USING, 400)
    }

    const hashPass = await hash(password)

    if (!hashPass.data || hashPass.error) {
        throw new ResponseModel(ErrorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
    }

    const result = await signUpUser({ params: [username, email, hashPass.data, phone, '/storage/default/default_profile_image.png'] })

    if (result.error) {
        throw new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)
    }

    res.json(new ResponseModel(ErrorMessages.GENERAL.SUCCESS, 200))
})


export const signIn = genericFunc(async (req, res, next) => {

    const { email, password } = req.body
    const { device, browser, audience } = res.locals

    const user = await findUserByEmail({ params: [email] })

    if (!user.data || user.error || user.data.is_active == ProfileStatus.DEACTIVE)
        throw new ResponseModel(ErrorMessages.USER.NOT_FOUNDED, 404)

    const userPassword = await findUserPasswordById({ params: [user.data.user_id] })

    if (!userPassword.data || userPassword.error)
        throw new ResponseModel(ErrorMessages.USER.NOT_FOUNDED, 400)

    else if (!userPassword.data.password)
        throw new ResponseModel(ErrorMessages.AUTH.WRONG_PASSWORD, 400)

    const checkPassword = await compare(password, userPassword.data.password)

    if (!checkPassword.data || checkPassword.error)
        throw new ResponseModel(checkPassword.error?.message ?? ErrorMessages.AUTH.WRONG_PASSWORD, 400)


    const access_token = generateToken({
        payload: { user_id: user.data.user_id },
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        subject: user.data.user_id.toString(),
        audience: audience
    })

    if (!access_token.data || access_token.error)
        throw new ResponseModel(access_token.error?.message || ErrorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)

    const refresh_token = generateToken({
        payload: { user_id: user.data.user_id, isRefreshToken: true },
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        subject: user.data.user_id.toString(),
        audience: audience
    })

    if (!refresh_token.data || refresh_token.error)
        throw new ResponseModel(refresh_token.error?.message || ErrorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)

    if (device === DeviceTypes.MOBILE || device === DeviceTypes.TABLET || device === DeviceTypes.DESKTOP) {
        res.json(new ResponseModel(ErrorMessages.AUTH.SUCCESSFULLY_SIGNED_IN, 200, [{ access_token, refresh_token }]));
        return
    } else if (browser) {
        const isDevelopment = process.env.NODE_ENV === "development"

        res.cookie("access_token", access_token.data, { maxAge: Number(process.env.ACCESS_TOKEN_EXPIRES_IN), httpOnly: true, sameSite: isDevelopment ? "lax" : "none", secure: !isDevelopment });
        res.cookie("refresh_token", refresh_token.data, { maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_IN), httpOnly: true, sameSite: isDevelopment ? "lax" : "none", secure: !isDevelopment });
        res.json(new ResponseModel(ErrorMessages.AUTH.SUCCESSFULLY_SIGNED_IN, 200));
        return
    } else {
        throw new ResponseModel(ErrorMessages.GENERAL.UNKNOWN_DEVICE, 500)
    }
})


export const resetPasssword = genericFunc(async (req, res, next) => {
    const { user_id } = res.locals.user
    const { password } = req.body

    const newPassword = await hash(password)

    if (!newPassword.data || newPassword.error)
        throw new ResponseModel(ErrorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)

    const updatePasswordResult = await updatePassword({ params: [newPassword.data, user_id] })

    if (!updatePasswordResult.data || updatePasswordResult.error)
        throw new ResponseModel(ErrorMessages.GENERAL.SOMETHING_WENT_WRONG, 500)

    res.json(new ResponseModel(ErrorMessages.PASSWORD.UPDATED, 200))
})

export const refreshToken = genericFunc(async (req, res, next) => {
    const { audience, device, browser } = res.locals
    const user: IUser = res.locals.user

    console.log("Refresh work 1")

    const access_token = generateToken({
        payload: { user_id: user.user_id },
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        subject: user.user_id.toString(),
        audience: audience,
    })
    console.log("Refresh work 2")

    if (device === DeviceTypes.MOBILE || device === DeviceTypes.TABLET || device === DeviceTypes.DESKTOP) {
        res.json(new ResponseModel(ErrorMessages.AUTH.SUCCESSFULLY_SIGNED_IN, 200, [{ access_token }]));
        return
    } else if (browser) {
        const isDevelopment = process.env.NODE_ENV === "development"
        console.log("Refresh work 3")
        res.cookie("access_token", access_token.data, {
            maxAge: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
            httpOnly: true,
            secure: !isDevelopment,
            sameSite: isDevelopment ? "lax" : "none"
        });
        res.json(new ResponseModel(ErrorMessages.AUTH.SUCCESSFULLY_SIGNED_IN, 200));
        return
    } else {
        throw new ResponseModel(ErrorMessages.GENERAL.UNKNOWN_DEVICE, 500)
    }

})


export const signOut = genericFunc(async (req, res, next) => {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    res.json(new ResponseModel(ErrorMessages.AUTH.SUCCESSFULLY_SIGNED_IN, 200))
})
