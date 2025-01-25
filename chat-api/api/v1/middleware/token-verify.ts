import { genericFunc } from "../common/generic-func";
import jwt from "jsonwebtoken"
import ResponseModel from "../model/error-model";
import errorCodes from "../common/error-codes";


export const accessTokenVerify = genericFunc(async(req,res,next) => {
    const {JWT_KEY, JWT_ISS} = process.env as {
        JWT_KEY: string;
        JWT_ISS: string
    }

    if(!JWT_KEY && !JWT_ISS)
        throw new ResponseModel(errorCodes.SOMETHING_WENT_WRONG, 500)

    const token = req.headers["authorization"]?.replace("Bearer " , "") 
    if(!token)
        throw new ResponseModel(errorCodes.TOKEN_MISS, 400)

    const decoded = jwt.verify(token, JWT_KEY)

    const decode = JSON.parse(JSON.stringify(decoded))
    res.locals.email = decode["email"]
    next()
})


export const refreshTokenVerify = genericFunc(async(req,res,next) => {
    const {JWT_KEY, JWT_ISS} = process.env as {
        JWT_KEY: string;
        JWT_ISS: string
    }

    if(!JWT_KEY && !JWT_ISS)
        throw new ResponseModel(errorCodes.SOMETHING_WENT_WRONG, 500)

    const token = req.headers["authorization"]?.replace("Bearer " , "") 
    if(!token)
        throw new ResponseModel(errorCodes.TOKEN_MISS, 400)

    const decoded = jwt.verify(token, JWT_KEY)

    const decode = JSON.parse(JSON.stringify(decoded))
    if (!decode["isRefreshToken"] || typeof decode["isRefreshToken"] !== "boolean" || !decode["isRefreshToken"]) {
        throw new ResponseModel(errorCodes.TOKEN_MISS, 400);
    }
    

    res.locals.email = decode["email"]
    next()
})





