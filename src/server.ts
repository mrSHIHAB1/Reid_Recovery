import mongoose from "mongoose";
import app from "./app"
import { Server } from "http"
import { envVars } from "./app/config/env";
let server:Server;

const startServer=async()=>{
    try{
      await mongoose.connect(envVars.DB_URL);
      console.log("connected to Database");
      server=app.listen(envVars.PORT,()=>{
        console.log(`server is listening to port ${envVars.PORT}`)
      })
    }
    catch(error){
        console.log(error)
    }
}

(async()=>{
    await startServer();
})()