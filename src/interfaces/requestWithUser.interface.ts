import { Users } from "authentification/user.interface";
import { Request } from "express";

interface RequestWithUser extends Request {
  user: Users;
}

export default RequestWithUser;
