import express, { NextFunction, Request, Response } from "express"
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

import { fileUploader } from "../../helpers/fileUpload";

const router = express.Router();

router.post("/register", UserControllers.createDriver);

router.post("/register/admin",
  fileUploader.upload.single('file'), checkAuth(Role.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    return UserControllers.createAdmin(req, res, next);
  });

router.post(
  "/register/user",
  (req: Request, res: Response, next: NextFunction) => {
    return UserControllers.createUserWithoutPhoto(req, res, next);
  }
);

// Step 1: User enters email → send OTP
router.post("/forgot-password", UserControllers.forgotPassword);

// Step 2: Verify OTP
router.post("/verify-otp", UserControllers.verifyOtp);

// Step 3: Reset password
router.post("/reset-password", UserControllers.resetPassword);

router.get("/all-users", UserControllers.getAllUsers)
router.get('/:id', UserControllers.getUserById)
router.delete('/:id', UserControllers.deleteUser)

router.patch(
  "/updateUsers",
  fileUploader.upload.single('file'),
  checkAuth(Role.DRIVER),
  (req: Request, res: Response, next: NextFunction) => {
    return UserControllers.updateUser(req, res, next);
  }
);





export const UserRoutes = router;