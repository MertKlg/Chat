import {ExtendedError, Socket, } from "socket.io";
import errorCodes from "../../common/error.messages";
import jwt from "jsonwebtoken"
import ResponseModel from "../../model/error-model";
import { verifyToken } from "../../common/jwt";
import { findUserById } from "../../model/auth/auth.model";

interface Token {
    email : string,
    isRefreshToken : boolean,
    exp? : number,
    iat? : Date
}

export const webSocketAccessTokenVerify = async(socket : Socket, next : (err? : ExtendedError) => void) => {
    try{
        const token = (socket.client.request.headers.cookie ?? "").split("; ").find(cookie => cookie.trim().startsWith("access_token"))?.trim()?.replace("access_token=", "") || socket.handshake.auth.token
        if(!token) {
            next(new ResponseModel(errorCodes.TOKEN.MISS, 401))
            return
        }

        const verify = verifyToken(token)

        if(!verify.data || verify.error){
            next(new ResponseModel(errorCodes.TOKEN.INVALID, 401))
            return
        }

        const {user_id, exp, iat} = JSON.parse(JSON.stringify(verify.data))

        const user = await findUserById({params : [user_id]})

        if(!user.data || user.error){
            throw new ResponseModel(user.error?.message ?? errorCodes.USER.NOT_FOUNDED, 404)
        }

        socket.data.user = user.data
        socket.data.exp = (Number(exp) * 1000) - Date.now()
        socket.data.iat = iat

        next()
    }catch(e){
        if(e instanceof Error || e instanceof ResponseModel){
            next(e)
            return
        }

        next(new ResponseModel(errorCodes.GENERAL.SOMETHING_WENT_WRONG, 500))
    }   
}

