import { Request, Response, NextFunction } from "express";

export const genericFunc = (
  callback: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(callback(req, res, next)).catch((e) => next(e));
  };
};

export const genericErrorHandler = (
  handler: (err: any, req: Request, res: Response, next: NextFunction) => any
) => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    try {
      return handler(err, req, res, next);
    } catch (e) {
      next(e);
    }
  };
};

export const genericProfilePhotoCompleter = (
  map: any[],
  searchValue: string = "photo"
): any[] => {
  if (!map) return [];
  const newMap = map.map((e: any) => {
    const json = JSON.parse(JSON.stringify(e));
    if (json) {
      const photo = json[searchValue];
      var newPhoto = "";
      if (photo) {
        newPhoto = `/storage/${json["users_id"] ?? json["user_id"]}/${photo}`;
      } else {
        newPhoto = `/storage/defaults/default_profile_image.png`;
      }
      json["photo"] = newPhoto;
    }
    e = json;
    return e;
  });
  return newMap;
};
