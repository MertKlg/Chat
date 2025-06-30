import { Request, Response, NextFunction } from "express";

export const genericFunc = (
  callback: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void

) => {
  return async(req: Request, res: Response, next: NextFunction) => {
    try{
      await Promise.resolve(callback(req, res, next));
    }catch(e){
      next(e)
    }
  };
};