import express from "express";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get("/", DashboardController.getDashboard);
router.get("/export", DashboardController.exportDashboardExcel);
router.get("/export-driver-tickets", DashboardController.exportDriverTicketReport);
router.get("/export-driver-comparison", DashboardController.exportDriverComparisonReport);
router.get("/export-unified-report", DashboardController.exportUnifiedReport);
export const DashboardRoutes = router;
