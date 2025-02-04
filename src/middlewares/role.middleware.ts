import express from "express";
import { decodedToken } from "./auth.middleware";
import { Result } from "../utils/utils";

const authorizeRoles = (...allowedRoles) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!allowedRoles.includes(decodedToken(req.cookies.Authorization)._role)) {
      res.status(403).send(new Result(false, "Access denied!", null));
      return;
    } else {
      next();
    }
  };
};

export default authorizeRoles;
