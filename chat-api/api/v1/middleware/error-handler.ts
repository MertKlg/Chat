import { NextFunction, Response, Request } from "express";
import ResponseModel from "../model/error-model";
import errorMessages from "../common/error.messages";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ResponseModel) {
        res.status(err.status || 500).json(err);
        return
    }

    res.status(500).json(new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500));
    return
};

export default errorHandler