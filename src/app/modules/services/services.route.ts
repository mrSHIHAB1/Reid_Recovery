import express from "express";
import { ServicesController } from "./services.controller";
import { fileUploader } from "../../helpers/fileUpload";

const router = express.Router();

router.post(
  "/create",
  fileUploader.upload.array("files", 10), 
  (req, res, next) => ServicesController.createService(req, res, next)
);

router.get("/:id", (req, res, next) => ServicesController.getServiceById(req, res, next));

router.get("/", (req, res, next) => ServicesController.getAllServices(req, res, next));

router.delete("/:id", (req, res, next) => ServicesController.deleteService(req, res, next));

export const ServicesRoutes = router;