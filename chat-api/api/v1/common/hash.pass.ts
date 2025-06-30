import bcrypt from "bcrypt"
import { IResult } from "../model/common/common.interface"

export const hash = async (value : string) : Promise<IResult<string>> => {
    try{
        return {
            data : await bcrypt.hash(value, 10)
        }
    }catch(e){
        return {
            error : e instanceof Error ? e : Error("Something went wrong")
        }
    }
}


export const compare = async (value : string, hashedValue : string) : Promise<IResult<boolean>> => {
    try{
        return {
            data : await bcrypt.compare(value, hashedValue)
        }
    }catch(e){
        return {
            error : e instanceof Error ? e : Error("Something went wrong")
        }
    }
} 