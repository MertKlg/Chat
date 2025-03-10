import { Router } from "express";
import { accessTokenVerify } from "../middleware/token-verify";
import { verifyUser } from "../middleware/verify-user";
import { getProfile, updateProfile } from "../controller/profile-controller";
import uaParserMiddleware from "../middleware/ua-parser";
import errorCodes from "../common/error-codes";
import { check } from "express-validator";
import inputValidator from "../middleware/input-validator";

const profileRouter = Router()


profileRouter.get("/get",[
    uaParserMiddleware,
    accessTokenVerify,
    verifyUser
], getProfile )

profileRouter.put(
    "/update",
    [
        accessTokenVerify,
        verifyUser,
        inputValidator([
            check("username")
                .not()
                .isEmpty()
                .withMessage(errorCodes.USERNAME_EMPTY)
                .escape()
                .trim(),

            check("email")
                .not()
                .isEmpty()
                .withMessage(errorCodes.EMAIL_EMPTY)
                .isEmail()
                .withMessage(errorCodes.EMAIL_NOT_VALIDATED)
                .escape()
                .trim(),

            check("phone")
                .not()
                .isEmpty()
                .withMessage(errorCodes.PHONE_EMPTY)
                .isMobilePhone("tr-TR")
                .withMessage(errorCodes.PHONE_NOT_VALIDATED)
                .escape()
                .trim(),
        ]),
    ],
    updateProfile
);


export default profileRouter
