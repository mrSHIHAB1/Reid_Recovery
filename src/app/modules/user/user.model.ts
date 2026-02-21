// models/User.ts
import mongoose, { Schema, model, Types, Document } from "mongoose";
import { IUser, IsActive, Role, AuthProviderType } from "./user.interface";


const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    picture: { type: String },
    address: { type: String },
    phone: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    isblocked: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.DRIVER,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
    reciveNotifications: { type: Boolean, default: true },
    auth_providers: [
      {
        provider: {
          type: String,
          enum: Object.values(AuthProviderType),
        },
        providerID: { type: String },
      },
    ],
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export const User = model<IUser>("User", UserSchema);
