import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  DRIVER = "DRIVER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum AuthProviderType {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
}

export interface IAuthProvider {
  provider: AuthProviderType;
  providerID: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  isblocked?: boolean;
  role: Role;
  fcmToken?: string;
  fcmTokens?: string[];
  reciveNotifications?: boolean;
  auth_providers?: IAuthProvider[];
  createdAt?: Date;
  updatedAt?: Date;
}