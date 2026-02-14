import express, { NextFunction, Request, Response } from "express"
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createAdminZodSchema,createGuideZodSchema,createTouristZodSchema, updateZodSchema, userValidation} from "./user.validation";
import { fileUploader } from "../../helpers/fileUpload";

const router =express.Router();

router.post(
  "/register/tourist",
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {

    req.body = userValidation.createTouristZodSchema.parse(
      JSON.parse(req.body.data)
    );

    return UserControllers.createTourist(req, res, next);
  }
);

router.post("/register/admin",
   fileUploader.upload.single('file'),checkAuth(Role.ADMIN),
(req: Request, res: Response, next: NextFunction) => {
  req.body = userValidation.createAdminZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserControllers.createAdmin(req, res, next);
} );

    
  
router.post("/register/guide",fileUploader.upload.single('file'), 
(req: Request, res: Response, next: NextFunction)=> {
   req.body=userValidation.createGuideZodSchema.parse(
      JSON.parse(req.body.data)
    ); 
    return UserControllers.createGuide(req, res, next)

})
router.get("/all-users", UserControllers.getAllUsers)
router.get('/:id',  UserControllers.getUserById)
router.delete('/:id',  UserControllers.deleteUser)
router.patch("/updateUsers/:id",validateRequest(updateZodSchema),UserControllers.Updatuser)

// Wishlist routes
router.post('/:userId/wishlist/add', UserControllers.addToWishlist)
router.delete('/:userId/wishlist/remove', UserControllers.removeFromWishlist)
router.get('/:userId/wishlist', UserControllers.getWishlist)



export const UserRoutes=router;