import { envVars } from "../../config/env";
import { verifyToken } from "../../utils/jwt";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens"
import { User } from "../user/user.model";

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }

}

const getMe = async (cookies: any) => {
  const accessToken = cookies?.accessToken;

  if (!accessToken) {
    throw new Error("Access token missing");
  }

  // verify token
  const decoded = verifyToken(
    accessToken,
    envVars.JWT_ACCESS_SECRET as string
  );

  // ensure decoded is an object with an email property
  if (typeof decoded === "string" || !decoded || typeof (decoded as any).email !== "string") {
    throw new Error("Invalid token payload");
  }

  const email = (decoded as any).email;

  // find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const { _id, email: userEmail, role, picture = null,phone = null,address = null, } = user;

  return {
    id: _id,
    email: userEmail,
    role,
    picture,
    phone,
    address,
    
  };
};


export const AuthServices={
    getNewAccessToken,
    getMe,
}