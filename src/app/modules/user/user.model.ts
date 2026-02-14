// models/User.ts
import mongoose, { Schema, model, Types, Document } from "mongoose";
import { IUser, IsActive, Role } from "./user.interface";


const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional
    phone: { type: String, required: true },
    picture: { type: String },
    address: { type: String },
    bio: { type: String },
    wishlist: { type: [Schema.Types.ObjectId], ref: 'Tour', default: [] },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    isblocked: { type: Boolean, default: false },
    expertise: { type: [String] },
    dailyrate: { type: Number },
    travelpreferences: { type: [String] },
    spokenLanguages: { type: [String] },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.TOURIST,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export const User = model<IUser>("User", UserSchema);
