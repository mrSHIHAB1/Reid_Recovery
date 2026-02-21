import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import passport from "passport";
import { envVars } from "../../config/env";


const router = Router();
router.post("/me", AuthControllers.getMe);
router.post("/login", AuthControllers.credentialsLogin);
router.post("/logout", AuthControllers.logout);

// Social Login Routes
router.get("/google", AuthControllers.googleLogin);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  AuthControllers.googleCallback,
);


// router.get("/apple", AuthControllers.appleLogin);
// Apple callback is usually a POST request
// router.post("/apple/callback", AuthControllers.socialLoginCallback);

export const AuthRoutes = router;