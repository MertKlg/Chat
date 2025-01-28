import { Router } from "express";
import { accessTokenVerify } from "../middleware/token-verify";
import inputValidator from "../middleware/input-validator";
import { check } from "express-validator";
import errorCodes from "../common/error-codes";
import { verifyUser } from "../middleware/verify-user";
import { getFriendRequests, myRequests, sendFriendRequest, updateFriendRequest } from "../controller/friend-controller";

const friendRouter = Router()

friendRouter.get("/incoming",
    [
        accessTokenVerify,
        verifyUser
    ],
    getFriendRequests
)

friendRouter.get("/my-requests", [
    accessTokenVerify,
    verifyUser
], myRequests)

friendRouter.post("/send-friend", [
    accessTokenVerify,
    verifyUser,
    inputValidator([
        check("toUser", errorCodes.USER_NOT_FOUND)
    ])
], sendFriendRequest)


friendRouter.put("/update-friend", [
    accessTokenVerify,
    verifyUser,
    inputValidator([
        check("friends_id", "friends_id required"),
        check("status", "Unknown status")
    ])
],updateFriendRequest)

friendRouter.delete("/asdasdadasd")

export default friendRouter