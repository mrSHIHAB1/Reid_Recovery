import { Types } from "mongoose";

export enum Role{
   ADMIN="ADMIN",
   TOURIST="TOURIST",
  GUIDE="GUIDE",

}


export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IUser {
    _id?: Types.ObjectId
    name: string;
    email: string;
    password: string;
    phone: string;
    picture?: string;
    address?: string;
    bio?: string;
    expertise?:string[];
    dailyrate?:number;
    travelpreferences?:string[];
    spokenLanguages?:string[];
    wishlist?: Types.ObjectId[];
    isDeleted?: string;
    isActive?: IsActive;
    isVerified?: boolean;
    isblocked?:boolean;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
}