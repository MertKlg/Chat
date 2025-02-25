import {Router} from "express"
import { signIn, signUp } from "../controller/auth-controller"
import inputValidator from "../middleware/input-validator"
import { check } from "express-validator"
import ResponseModel from "../model/error-model"
import errorCodes from "../common/error-codes"
<<<<<<< HEAD
import uaParserMiddleware from "../middleware/ua-parser"
import { accessTokenVerify, refreshTokenVerify } from "../middleware/token-verify"
import { verifyUser } from "../middleware/verify-user"
=======
>>>>>>> parent of 1a1b01c (Auth update)

const authRouter = Router()

authRouter.post("/sign-up", inputValidator([
    check("username", errorCodes.USERNAME_EMPTY)
    .escape()
    .isLength({min : 3, max : 12})
    .withMessage(errorCodes.USERNAME_LENGHT),

    check("email",errorCodes.EMAIL_EMPTY)
    .escape()
    .isEmail(),
    
    check("phone", "send validate phone number")
    .isMobilePhone("tr-TR"),

    check("password", errorCodes.PASSWORD_WEAK)
    .escape()
    .isStrongPassword(),

    check("passwordAgain", errorCodes.PASSWORD_WEAK)
    .escape()
    .isStrongPassword()
    .custom(async (confirmPassword, { req }) => {
        const passwordAgain = confirmPassword as string;
        const password = req.body.password as string;
        if (passwordAgain !== password)
          throw new ResponseModel(errorCodes.PASSWORDS_NOT_SAME, 400)
      })



]) ,signUp)

<<<<<<< HEAD


authRouter.post("/sign-in",[
    inputValidator([
        check("email",errorCodes.EMAIL_NOT_VALIDATED)
        .escape()
        .trim()
        .isEmail(),

        check("password", errorCodes.PASSWORD_WEAK)
        .escape()
        .trim()
        .isStrongPassword()
    ]),
    uaParserMiddleware
], signIn)


authRouter.put("/reset-password", [
    accessTokenVerify,
    verifyUser,
    inputValidator([
        check("password", errorCodes.PASSWORD_WEAK)
        .escape()
        .trim()
        .isStrongPassword()
    ])
],resetPasssword)

authRouter.post("/refresh", [
    refreshTokenVerify,
    verifyUser,
    uaParserMiddleware
], refreshToken )
=======
authRouter.post("/sign-in", signIn)
>>>>>>> parent of 1a1b01c (Auth update)


export default authRouter