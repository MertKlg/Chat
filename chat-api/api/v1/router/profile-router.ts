import { Router } from "express";
import { accessTokenVerify } from "../middleware/token-verify";
import { verifyUser } from "../middleware/verify-user";
import { deleteProfile, getProfile, updateProfile, updateProfilePhoto } from "../controller/profile-controller";
import uaParserMiddleware from "../middleware/ua-parser";
import errorCodes from "../common/error.messages";
import { check } from "express-validator";
import inputValidator from "../middleware/input-validator";
import imageStorage from "../../../service/image-storage";

const profileRouter = Router()

profileRouter.get("/get",[
    accessTokenVerify,
    uaParserMiddleware
], getProfile )

profileRouter.put(
    "/update",
    [
        accessTokenVerify,
        verifyUser,
        inputValidator([
            check("username")
                .optional()
                .not()
                .isEmpty()
                .withMessage(errorCodes.USERNAME.EMPTY)
                .escape()
                .trim(),

            check("email")
            .optional()
                .not()
                .isEmpty()
                .withMessage(errorCodes.EMAIL.EMPTY)
                .isEmail()
                .withMessage(errorCodes.EMAIL.NOT_VALIDATED)
                .escape()
                .trim(),

            check("phone")
            .optional()
                .not()
                .isEmpty()
                .withMessage(errorCodes.PHONE.EMPTY)
                .isMobilePhone("tr-TR")
                .withMessage(errorCodes.PHONE.NOT_VALIDATED)
                .escape()
                .trim(),
        ]),
        
    ],
    updateProfile
);

profileRouter.put("/update-photo", [
    accessTokenVerify,
    verifyUser,
    imageStorage.single('photo')
], updateProfilePhoto)

profileRouter.delete("/delete", [
    accessTokenVerify,
    verifyUser
], deleteProfile)


export default profileRouter
