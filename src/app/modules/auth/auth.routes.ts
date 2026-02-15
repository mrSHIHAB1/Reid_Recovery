import { Router } from "express";
import { AuthControllers } from "./auth.controller";


const router = Router()
router.post('/me',AuthControllers.getMe)
router.post("/login", AuthControllers.credentialsLogin)
router.post("/logout",AuthControllers.logout)
export const AuthRoutes = router;