import express from "express";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get("/", DashboardController.getDashboard);
router.get("/export", DashboardController.exportDashboardExcel);
export const DashboardRoutes = router;
