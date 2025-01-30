import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthentificationTokenException";
import express from "express";
import RequestWithUser from "interfaces/requestWithUser.interface";
import jwt from "jsonwebtoken";
import DataStoredInToken from "token/dataStorageInToken.interface";

export function authMiddleware(
  request: RequestWithUser,
  response: express.Response,
  next: express.NextFunction
) {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    try {
      const email = decodedToken(cookies.Authorization);
      if (email == process.env.ADMIN_EMAIL) {
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      console.log(error);
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export function decodedToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
    return verificationResponse._email;
  } catch {
    return null
  }
}
