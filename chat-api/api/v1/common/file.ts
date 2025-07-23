import fs from "fs";
import path from "path"
import nodeFs from "node:fs/promises"
import { IResult } from "../model/common/common.interface";
import errorMessages from "./error.messages";

export const deleteStorageFile = (folderName?: string, fileName?: string) : IResult<string> => {
    try {
        if(!folderName || !fileName){
            return {
                error : Error("Check your foldername  or filename")
            }
        }

        const filePath = path.join(__dirname, '../../../storage', folderName, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {}
    } catch (e) {
        return {
            error : e instanceof Error ? e : Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
        }
    }
}


export const deleteStorageFileAsync = async (file?: string) : Promise<IResult<string>> => {
    try{
        if(!file){
            return {
                error : Error("Check your file") 
            }
        }

        const filePath = path.join(__dirname, "../../..",file)


        if(await nodeFs.readFile(filePath)){
            await nodeFs.unlink(filePath)
        }

        return {
            data : "Success"
        }
    }catch(e){
        return {
            error : e instanceof Error ? e : Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
        }
    }
}