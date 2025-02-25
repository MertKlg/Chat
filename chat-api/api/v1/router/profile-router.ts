import { Router } from "express";
import { accessTokenVerify } from "../middleware/token-verify";
import { verifyUser } from "../middleware/verify-user";
import { getProfile } from "../controller/profile-controller";
import uaParserMiddleware from "../middleware/ua-parser";

const profileRouter = Router()


profileRouter.get("/get",[
    uaParserMiddleware,
    accessTokenVerify,
    verifyUser
], getProfile )


export default profileRouter
