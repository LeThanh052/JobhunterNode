import { NextFunction, Request, Response } from "express";

type RouteMeta = {
  isPublic?: boolean;
  skipPermission?: boolean;
  message?: string;
  permissionPath?: string;
};

export function withRouteMeta(meta: RouteMeta) {
  return (request: Request, _response: Response, next: NextFunction) => {
    request.routeMeta = meta;
    next();
  };
}
