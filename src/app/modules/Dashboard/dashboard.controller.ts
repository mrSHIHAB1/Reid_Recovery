import { Request, Response } from "express";
import { getDashboardData } from "./dashboard.service";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getDashboardData();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};