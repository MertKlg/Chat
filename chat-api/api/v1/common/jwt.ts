import { IJwt, IResult } from "../model/common/common.interface";
import jwt, { JwtPayload } from "jsonwebtoken"
import errorMessages from "./error.messages";

const { JWT_KEY, JWT_ISS, NODE_ENV } = process.env as {
    JWT_KEY: string;
    JWT_ISS: string;
    NODE_ENV : string
};

export const generateToken = (iJwt: IJwt): IResult<string> => {
    try {
        return {
            data: jwt.sign(iJwt.payload, JWT_KEY, {
                expiresIn: iJwt.expiresIn,
                issuer: JWT_ISS,
                audience: iJwt.audience,
                subject: iJwt.subject
            })
        }
    } catch (e) {
        return {
            error : e instanceof Error ? e : Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
        }
    }
}

export const verifyToken = (token: string): IResult<JwtPayload | string> => {
    try {
        return {
            data: jwt.verify(token, JWT_KEY)
        }
    } catch (e) {
        return {
            error : e instanceof Error ? e : Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
        }
    }
}