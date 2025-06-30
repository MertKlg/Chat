import { genericFunc } from "../common/generic-func";
import jwt from "jsonwebtoken";
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error.messages";
import { Request } from "express";
import { IResult } from "../model/common/common.interface";
import { verifyToken } from "../common/jwt";
import errorMessages from "../common/error.messages";
import { findUserById } from "../model/auth/auth.model";

type TokenType = "access_token" | "refresh_token";

export const accessTokenVerify = genericFunc(async(req, res, next) => {
    const token = extractToken("access_token", req);

    if(!token.data || token.error)
        throw new ResponseModel(token.error?.message || errorMessages.TOKEN.MISS, 401)

    const tokenVerify = verifyToken(token.data)

    if(tokenVerify.error){
        throw new ResponseModel(tokenVerify.error.message, 501)
    }

    const decode = JSON.parse(JSON.stringify(tokenVerify.data))
    const user_id = decode["user_id"]

    const user = await findUserById({params : [user_id]})

    if(!user.data || user.error){
        throw new ResponseModel(user.error?.message || errorMessages.USER.NOT_FOUNDED, 404)
    }

    res.locals.user = user.data
    next();
});

export const refreshTokenVerify = genericFunc(async(req, res, next) => {

    const token = extractToken("refresh_token", req);

    if(!token.data || token.error)
        throw new ResponseModel(token.error?.message ?? errorMessages.TOKEN.MISS, 401)

    const tokenVerify = verifyToken(token.data)

    if(tokenVerify.error){
        throw new ResponseModel(tokenVerify.error.message, 401)
    }

    const decode = JSON.parse(JSON.stringify(tokenVerify.data))
    
    if (
        !decode["isRefreshToken"] ||
        typeof decode["isRefreshToken"] !== "boolean" ||
        !decode["isRefreshToken"]
    ) {
        throw new ResponseModel(errorMessages.TOKEN.MISS, 401);
    }
    
    const user_id = decode["user_id"]

    const user = await findUserById({params : [user_id]})

    if(!user.data || user.error){
        throw new ResponseModel(user.error?.message || errorMessages.USER.NOT_FOUNDED, 404)
    }

    res.locals.user = user.data
    next();
});

const extractToken = (
    tokenType: TokenType,
    req: Request
): IResult<string> => {
    if (req.cookies[tokenType]) {
        return {
            data : req.cookies[tokenType]
        }
    }

    const token = req.headers.authorization;

    if (token) {
        const parts = token.replace("Bearer ", "");
        return {
            data : parts
        }
    }

    return {
        error : Error("No token founded")
    };
};
