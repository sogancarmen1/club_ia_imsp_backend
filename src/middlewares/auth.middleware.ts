import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthentificationTokenException";
import express from "express";
import RequestWithUser from "interfaces/requestWithUser.interface";
import jwt from "jsonwebtoken";
import DataStoredInToken from "token/dataStorageInToken.interface";
import { Result } from "../utils/utils";

export function authMiddleware(
  request: RequestWithUser,
  response: express.Response,
  next: express.NextFunction
) {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    const user = decodedToken(cookies.Authorization);
    if (Number(user?._id) > 0) {
      request.user = {
        email: user?._email,
        id: user?._id,
        role: user?._role,
        data_inscription: "",
        state: "",
        password: "",
      };
      next();
    } else {
      response.send(new Result(false, "Wrong credentials provided!", null));
    }
  } else {
    response.send(new Result(false, "Wrong authentication token!", null));
    // next(new AuthenticationTokenMissingException());
  }
}

export function decodedToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
    return verificationResponse;
  } catch {
    return null;
  }
}
