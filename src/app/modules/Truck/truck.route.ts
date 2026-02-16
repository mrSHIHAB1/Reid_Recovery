import express from "express";
import { TruckController } from "./truck.controller";
import { fileUploader } from "../../helpers/fileUpload";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post("/create",checkAuth(Role.DRIVER), TruckController.createTruck);
router.patch("/update/:id", TruckController.updateTruck);
router.get("/:id", TruckController.getTruck);
router.get("/", TruckController.getAllTrucks);
router.delete("/:id", TruckController.deleteTruck);
router.post(
  "/create-from-image",
  fileUploader.memoryUpload.single("image"),
  TruckController.createTruckFromImage,
);
export const TruckRoutes = router;