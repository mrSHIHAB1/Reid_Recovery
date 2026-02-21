import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus, { StatusCodes } from "http-status-codes";
import { AuthServices } from "./auth.service";
import { User } from "../user/user.model";
import bcrypt from "bcrypt";
import passport from "passport";


function sanitizeRedirect(input: unknown) {
  if (typeof input !== "string") return "/";
  if (!input.startsWith("/")) return "/";
  if (input.startsWith("//")) return "/";
  return input;
}

function encodeState(payload: any) {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64url");
}
function decodeState(state?: string) {
  if (!state) return null;
  try {
    const json = Buffer.from(state, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      { session: false },
      async (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user)
          return next(
            new AppError(
              StatusCodes.FORBIDDEN,
              info?.message || "Login failed",
            ),
          );

        const userTokens = await createUserTokens(user);

        // Remove password from response
        const { password: pwd, ...rest } = (user as any).toObject ? (user as any).toObject() : user;

        // Set cookies
        setAuthCookie(res, userTokens);

        sendResponse(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: "User Logged In Successfully",
          data: {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            user: rest,
          },
        });
      },
    )(req, res, next);
  },
);
// --------------------
// Logout
// --------------------
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

// --------------------
// Get Logged-in User
// --------------------
const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await AuthServices.getMe(userSession);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

// --------------------
// Social Login
// --------------------
const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?._id)
    throw new AppError(StatusCodes.FORBIDDEN, "Google login failed");

  const userTokens = await createUserTokens(user);
  setAuthCookie(res, userTokens);


  // Get redirect from state
  const decoded = decodeState(req.query.state as string);
  const redirect = sanitizeRedirect(decoded?.redirect);

  // ✅ Web: redirect to FE success page (cookie already set)
  // You can read /me on frontend.
  res.redirect(
    `${redirect}?token=${userTokens.accessToken}&userId=${user._id}`,
  );
});


export const AuthControllers = {
  credentialsLogin,
  logout,
  getMe,
  googleLogin,
  googleCallback
  // appleLogin,
  // socialLoginCallback,
};
