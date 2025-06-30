import { Router } from "express";
import {
    refreshToken,
    resetPasssword,
    signIn,
    signOut,
    signUp,
} from "../controller/auth-controller";
import inputValidator from "../middleware/input-validator";
import { check } from "express-validator";
import ResponseModel from "../model/error-model";
import errorMessages from "../common/error.messages";
import uaParserMiddleware from "../middleware/ua-parser";
import {
    accessTokenVerify,
    refreshTokenVerify,
} from "../middleware/token-verify";
import { verifyUser } from "../middleware/verify-user";

const authRouter = Router();

authRouter.post(
    "/sign-up",
    inputValidator([
        check("username", errorMessages.USERNAME.EMPTY)
            .escape()
            .isLength({ min: 3, max: 12 })
            .withMessage(errorMessages.USERNAME.LENGTH),

        check("email", errorMessages.EMAIL.ALREADY_USING).escape().isEmail(),

        check("phone", "send validate phone number").isMobilePhone("tr-TR"),

        check("password", errorMessages.PASSWORD.WEAK).escape().isStrongPassword(),

        check("passwordAgain", errorMessages.PASSWORD.WEAK)
            .escape()
            .isStrongPassword()
            .custom(async (confirmPassword, { req }) => {
                const passwordAgain = confirmPassword as string;
                const password = req.body.password as string;
                if (passwordAgain !== password)
                    throw new ResponseModel(errorMessages.PASSWORD.NOT_SAME, 400);
            }),
    ]),
    signUp
);

authRouter.post(
    "/sign-in",
    [
        inputValidator([
            check("email", errorMessages.EMAIL.NOT_VALIDATED)
            .escape()
            .trim()
            .isEmail(),

            check("password", errorMessages.PASSWORD.WEAK)
                .escape()
                .trim()
                .isStrongPassword(),
        ]),
        uaParserMiddleware,
    ],
    signIn
);

authRouter.put(
    "/reset-password",
    [
        accessTokenVerify,
        verifyUser,
        inputValidator([
            check("password", errorMessages.PASSWORD.WEAK)
                .escape()
                .trim()
                .isStrongPassword(),
        ]),
    ],
    resetPasssword
);

authRouter.post(
    "/refresh",
    [refreshTokenVerify, uaParserMiddleware],
    refreshToken
);

authRouter.post("/sign-out",[ accessTokenVerify, verifyUser ], signOut)



export default authRouter;
