import express from "express";
import { TruckController } from "./truck.controller";

const router = express.Router();

router.post("/create", TruckController.createTruck);
router.patch("/update/:id", TruckController.updateTruck);
router.get("/:id", TruckController.getTruck);
router.get("/", TruckController.getAllTrucks);
router.delete("/:id", TruckController.deleteTruck);

export const TruckRoutes = router;