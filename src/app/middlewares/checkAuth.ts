import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes"
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let accessToken: string | undefined;

      // 1️⃣ Check Authorization Header first
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        accessToken = req.headers.authorization.split(" ")[1];
      }

      // 2️⃣ If not found, check cookies
      if (!accessToken && req.cookies?.accessToken) {
        accessToken = req.cookies.accessToken;
      }

      // 3️⃣ If still no token
      if (!accessToken) {
        throw new AppError(403, "No Token Received");
      }

      // 4️⃣ Verify Token
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      // 5️⃣ Check User
      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User is deleted"
        );
      }

      // 6️⃣ Role Check
      if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          "You are not permitted to view this route!!!"
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(new AppError(401, "Token expired"));
      }

      if (error.name === "JsonWebTokenError") {
        return next(new AppError(401, "Invalid token"));
      }

      next(error);
    }
  };
