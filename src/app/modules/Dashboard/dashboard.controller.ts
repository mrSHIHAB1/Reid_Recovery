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

const exportDriverTicketReport = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      driverId: req.query.driverId as string,
      driverName: req.query.driverName as string
    };

    const tickets: any = await DashboardService.getDriverTicketsForExport(filters);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Driver Tickets");

    sheet.columns = [
      { header: "Ticket ID", key: "ticket", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Truck No", key: "truckNo", width: 15 },
      { header: "Yardage", key: "yardage", width: 10 },
      { header: "Driver Name", key: "driverName", width: 25 },
      { header: "Driver Email", key: "driverEmail", width: 25 },
      { header: "Driver Phone", key: "driverPhone", width: 15 },
    ];

    tickets.forEach((t: any) => {
      const driver = t.driver || {}; // Handle populated driver
      sheet.addRow({
        ticket: t.ticket,
        date: t.date ? new Date(t.date).toLocaleDateString() : "",
        truckNo: t.truckNo,
        yardage: t.yardage,
        driverName: driver.name || "N/A",
        driverEmail: driver.email || "N/A",
        driverPhone: driver.phone || "N/A",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=driver_tickets_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to export driver tickets Excel",
      error,
    });
  }
};

const exportDriverComparisonReport = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      driverId: req.query.driverId as string,
      driverName: req.query.driverName as string
    };

    const { grandTotalYardage, grandTotalTickets, driverStats } = await DashboardService.getDriverComparisonStats(filters);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Driver Comparison");

    sheet.columns = [
      { header: "Driver Name", key: "driverName", width: 25 },
      { header: "Driver ID", key: "driverId", width: 25 },
      { header: "Total Tickets", key: "totalTickets", width: 15 },
      { header: "Total Yardage", key: "totalYardage", width: 15 },
      { header: "% of Total Yardage", key: "percentage", width: 20 },
    ];

    driverStats.forEach((driver: any) => {
      const percentage = grandTotalYardage > 0
        ? ((driver.totalYardage / grandTotalYardage) * 100).toFixed(2)
        : "0.00";

      sheet.addRow({
        driverName: driver.driverName || "Unknown",
        driverId: driver.driverId,
        totalTickets: driver.totalTickets,
        totalYardage: driver.totalYardage,
        percentage: `${percentage}%`,
      });
    });

    // Add a summary row at the bottom
    sheet.addRow({});
    sheet.addRow({
      driverName: "TOTALS",
      totalTickets: grandTotalTickets,
      totalYardage: grandTotalYardage,
      percentage: "100%"
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=driver_comparison_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to export driver comparison Excel",
      error,
    });
  }
};


const exportUnifiedReport = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      driverId: req.query.driverId as string,
      //   driverName: req.query.driverName as string // Not used significantly in this specific report per requirements, mainly ID or date
    };

    const { dayWise, driverWise } = await DashboardService.getUnifiedStats(filters);

    const workbook = new ExcelJS.Workbook();

    // --- Sheet 1: Day Wise ---
    const daySheet = workbook.addWorksheet("Day Wise");
    daySheet.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Total Tickets", key: "totalTickets", width: 15 },
      { header: "Total Yardage", key: "totalYardage", width: 15 },
    ];

    dayWise.forEach((item: any) => {
      const { year, month, day } = item._id;
      daySheet.addRow({
        date: `${year}-${month}-${day}`,
        totalTickets: item.totalTickets,
        totalYardage: item.totalYardage,
      });
    });

    // --- Sheet 2: Driver Wise ---
    const driverSheet = workbook.addWorksheet("Driver Wise");
    driverSheet.columns = [
      { header: "Driver Name", key: "driverName", width: 25 },
      { header: "Driver ID", key: "driverId", width: 25 },
      { header: "Total Tickets", key: "totalTickets", width: 15 },
      { header: "Total Yardage", key: "totalYardage", width: 15 },
    ];

    driverWise.forEach((driver: any) => {
      driverSheet.addRow({
        driverName: driver.driverName || "Unknown",
        driverId: driver.driverId,
        totalTickets: driver.totalTickets,
        totalYardage: driver.totalYardage,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=unified_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to export unified report",
      error,
    });
  }
};

export const DashboardController = {
  getDashboard,
  exportDashboardExcel,
  exportDriverTicketReport,
  exportDriverComparisonReport,
  exportUnifiedReport
};
