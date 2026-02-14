import express, { Request, Response } from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";
import { envVars } from './app/config/env';

import expressSession from "express-session";
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app=express();

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin:['http://localhost:3000', 'https://meet-my-guide-frontend.vercel.app'],
    credentials:true,
}))

app.use("/api/v1",router)
app.get('/',(req:Request,res:Response)=>{
    res.status(200).json({
        message:"GUIDE"
    })
})

app.use(globalErrorHandler)

app.use(notFound)
export default app;