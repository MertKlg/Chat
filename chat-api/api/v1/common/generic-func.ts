import { Request,Response,NextFunction } from "express";

export const genericFunc = (
  callback: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(callback(req, res, next)).catch((e) => next(e));
  };
};



export const genericErrorHandler = (handler: (err: any, req: Request, res: Response, next: NextFunction) => any) => {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
      try {
        return handler(err, req, res, next);
      } catch (e) {
        next(e);
      }
    };
  };
  