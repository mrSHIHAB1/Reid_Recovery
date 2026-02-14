import dotenv from "dotenv";

dotenv.config()

interface EnvConfig {
    PORT: string,
    DB_URL: string,
  NODE_ENV: "development" | "production"
    BCRYPT_SALT_ROUND: string
    JWT_ACCESS_SECRET: string
    JWT_ACCESS_EXPIRES: string
        JWT_REFRESH_SECRET: string
    JWT_REFRESH_EXPIRES: string
    EXPRESS_SESSION_SECRET: string
    cloudinary: {
        api_key?: string,
        api_secret?: string,
        cloud_name?: string
    }
   STRIPE_SECRET_KEY?: string
   APP_PASS?:string
   STRIPE_WEBHOOK_SECRET?: string
}
const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = ["PORT", "DB_URL","NODE_ENV","BCRYPT_SALT_ROUND", "JWT_ACCESS_EXPIRES", "JWT_ACCESS_SECRET", "EXPRESS_SESSION_SECRET"];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variabl ${key}`)
        }
    })

    return {
        PORT: process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        DB_URL: process.env.DB_URL!,
                BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
       EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        cloudinary: {
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
    },
   STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
   APP_PASS: process.env.APP_PASS,
   STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    }
}

export const envVars = loadEnvVariables()