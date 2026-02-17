// import { z } from "zod";

// const createUserZodSchema = z.object({
//     name: z.string().nonempty("Name is required"),
//     email: z.string().email("Invalid email format"),
//     password: z.string().min(6, "Password must be at least 6 characters"),
//     address: z.string().optional(),
//     role: z.enum(["ADMIN", "DRIVER"]).optional(),
// });

// const updateUserZodSchema = z.object({
//     name: z.string().optional(),
//     email: z.string().email("Invalid email format").optional(),
//     phone: z.string().optional(),
//     address: z.string().optional(),
//     role: z.enum(["ADMIN", "DRIVER"]).optional(),
// });

// export const userValidation = {
//     createUserZodSchema,
//     updateUserZodSchema,
// };