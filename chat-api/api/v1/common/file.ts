import fs from "fs";
import path from "path"
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