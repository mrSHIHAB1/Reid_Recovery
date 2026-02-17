import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import ExcelJS from "exceljs";
const getDashboard = async (req: Request, res: Response) => {
  try {
    const result = await DashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
      error,
    });
  }
};
const exportDashboardExcel = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getDashboardStats();

    const workbook = new ExcelJS.Workbook();

    // 🔹 Sheet 1: Summary
    const summarySheet = workbook.addWorksheet("Summary");

    summarySheet.addRow(["Total Yardage", data.totalYardage]);
    summarySheet.addRow(["Total Drivers", data.totalDrivers]);
    summarySheet.addRow(["Today's Yardage", data.todaysYardage]);
    summarySheet.addRow(["Total Tickets", data.totalTickets]);

    // 🔹 Sheet 2: Tickets Per Driver
    const driverSheet = workbook.addWorksheet("Tickets Per Driver");

    driverSheet.columns = [
      { header: "Driver Name", key: "driverName", width: 25 },
      { header: "Total Tickets", key: "totalTickets", width: 20 },
    ];

    data.ticketsPerDriver.forEach((driver: any) => {
      driverSheet.addRow(driver);
    });

    // 🔹 Sheet 3: Yardage Per Day
    const daySheet = workbook.addWorksheet("Yardage Per Day");

    daySheet.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Total Yardage", key: "totalYardage", width: 20 },
    ];

    data.yardagePerDay.forEach((item: any) => {
      const { year, month, day } = item._id;
      daySheet.addRow({
        date: `${year}-${month}-${day}`,
        totalYardage: item.totalYardage,
      });
    });

    // 🔹 Sheet 4: Yardage Per Month
    const monthSheet = workbook.addWorksheet("Yardage Per Month");

    monthSheet.columns = [
      { header: "Year-Month", key: "month", width: 20 },
      { header: "Total Yardage", key: "totalYardage", width: 20 },
    ];

    data.yardagePerMonth.forEach((item: any) => {
      const { year, month } = item._id;
      monthSheet.addRow({
        month: `${year}-${month}`,
        totalYardage: item.totalYardage,
      });
    });

    // 🔥 Send File
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dashboard-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to export Excel",
      error,
    });
  }
};
export const DashboardController = {
  getDashboard,
  exportDashboardExcel 
};
