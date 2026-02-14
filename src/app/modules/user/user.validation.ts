import { z } from "zod";
import { IsActive, Role } from "./user.interface";
import { tr } from "zod/v4/locales";

export const createTouristZodSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string({ error: "Email is required" })
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string({ error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
    travelpreferences: z.array(z.string()).optional(),
    spokenLanguages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  phone:z.string().max(11,{message:"Phone number cannot exceed 11 characters."}),
 role: z.enum(["ADMIN", "GUIDE", "TOURIST"]).optional(), 
  address: z
    .string()
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),

  isVerified: z.boolean().optional(),

});
export const createAdminZodSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string({ error: "Email is required" })
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string({ error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
  bio: z.string().optional(),
   spokenLanguages: z.array(z.string()).optional(),
  phone:z.string().max(11,{message:"Phone number cannot exceed 11 characters."}),
 role: z.enum(["ADMIN", "GUIDE", "TOURIST"]).optional(), 
  address: z
    .string()
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),

  isVerified: z.boolean().optional(),

});
export const createGuideZodSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string({ error: "Email is required" })
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
 spokenLanguages: z.array(z.string()).optional(),
  password: z
    .string({ error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
  bio: z.string().optional(),
  phone:z.string().max(11,{message:"Phone number cannot exceed 11 characters."}),
 role: z.enum(["ADMIN", "GUIDE", "TOURIST"]).optional(), 
  address: z
    .string()
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
expertise: z.array(z.string()).optional(),
dailyrate: z.number().optional(),

  isVerified: z.boolean().optional(),
 
});



export const updateZodSchema=z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }).optional(),

  email: z
    .string({ error: "Email is required" })
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }).optional(),

  password: z
    .string({ error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }).optional(),
  phone: z
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),

  address: z
    .string()
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),

  isVerified: z.boolean().optional(),
  isblocked:z.boolean().optional(),
  sendinfo: z.array(z.string()).optional(),
  reciveinfo: z.array(z.string()).optional(),
});

export const userValidation={
  createTouristZodSchema,
  createAdminZodSchema,
  createGuideZodSchema,
  updateZodSchema,
}