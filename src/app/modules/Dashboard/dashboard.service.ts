import { Truck } from "../Truck/truck.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import mongoose from "mongoose";


const getDashboardStats = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 🔥 Run all aggregations in parallel
  const [
    totalYardageResult,
    totalTickets,
    totalDrivers,
    todaysYardageResult,
    ticketsPerDriver,
    yardagePerDay,
    yardagePerMonth,
  ] = await Promise.all([
    // Total Yardage
    Truck.aggregate([
      { $group: { _id: null, total: { $sum: "$yardage" } } },
    ]),

    // Total Tickets
    Truck.countDocuments(),

    // Total Drivers
    User.countDocuments({
      role: Role.DRIVER,
      isDeleted: false,
    }),

    // Today's Yardage
    Truck.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      { $group: { _id: null, total: { $sum: "$yardage" } } },
    ]),

    // 🔹 Tickets Per Driver
    Truck.aggregate([
      {
        $group: {
          _id: "$driver",
          totalTickets: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driverInfo",
        },
      },
      { $unwind: "$driverInfo" },
      {
        $project: {
          driverName: "$driverInfo.name",
          totalTickets: 1,
        },
      },
    ]),

    // 🔹 Yardage Per Day
    Truck.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalYardage: { $sum: "$yardage" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),

    // 🔹 Yardage Per Month
    Truck.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalYardage: { $sum: "$yardage" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  return {
    totalYardage: totalYardageResult[0]?.total || 0,
    totalDrivers,
    todaysYardage: todaysYardageResult[0]?.total || 0,
    totalTickets,
    ticketsPerDriver,
    yardagePerDay,
    yardagePerMonth,
  };
};


interface ExportFilters {
  startDate?: string;
  endDate?: string;
  driverId?: string;
  driverName?: string;
}

const getDriverTicketsForExport = async (filters: ExportFilters = {}) => {
  const query: any = {};

  // 1. Date Range Filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // 2. Driver Filter (by ID) directly on Truck if provided
  if (filters.driverId) {
    query.driver = filters.driverId;
  }

  let tickets = await Truck.find(query).populate("driver", "name email contactNumber role").lean();

  // 3. Driver Filter (by Name) - requires filtering in memory or complex aggregation
  // Since we populate, we can filter in memory or use aggregation.
  // Given the previous pattern, let's filter in memory if driverName is provided,
  // or we could use aggregation. Let's stick to `find` and filter in memory for simplicity if dataset is reasonable,
  // or use aggregation if we want to be robust. 
  // However, if driverName is partial match, memory filter is easier on populated field.
  if (filters.driverName) {
    const searchTerm = filters.driverName.toLowerCase();
    tickets = tickets.filter((ticket: any) =>
      ticket.driver && ticket.driver.name.toLowerCase().includes(searchTerm)
    );
  }

  return tickets;
};


const getDriverComparisonStats = async (filters: ExportFilters = {}) => {
  const matchStage: any = {};

  // 1. Date Range Filter
  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = end;
    }
  }

  // 2. Driver ID Filter
  if (filters.driverId) {
    matchStage.driver = new mongoose.Types.ObjectId(filters.driverId);
  }

  const pipeline: any[] = [
    { $match: matchStage },
    {
      $facet: {
        // 1. Calculate overall total yardage
        grandTotal: [
          { $group: { _id: null, totalYardage: { $sum: "$yardage" }, totalTickets: { $sum: 1 } } }
        ],
        // 2. Calculate per-driver stats
        byDriver: [
          {
            $group: {
              _id: "$driver",
              totalYardage: { $sum: "$yardage" },
              totalTickets: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "driverInfo"
            }
          },
          { $unwind: "$driverInfo" },
          {
            $project: {
              driverId: "$_id",
              driverName: "$driverInfo.name",
              totalYardage: 1,
              totalTickets: 1
            }
          }
        ]
      }
    }
  ];

  // If filtering by driver name, we need to filter AFTER lookup in the `byDriver` pipeline
  if (filters.driverName) {
    // Inject a match stage into the `byDriver` pipeline after $project
    const byDriverPipeline = pipeline[1].$facet.byDriver;
    byDriverPipeline.push({
      $match: {
        driverName: { $regex: filters.driverName, $options: "i" }
      }
    });
  }

  const result = await Truck.aggregate(pipeline);

  const grandTotalYardage = result[0].grandTotal[0]?.totalYardage || 0;
  const grandTotalTickets = result[0].grandTotal[0]?.totalTickets || 0;
  const driverStats = result[0].byDriver || [];

  return {
    grandTotalYardage,
    grandTotalTickets,
    driverStats
  };
};


const getUnifiedStats = async (filters: ExportFilters = {}) => {
  const matchStage: any = {};

  // 1. Date Range Handling (Default to TODAY if not provided)
  if (!filters.startDate && !filters.endDate) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    matchStage.createdAt = {
      $gte: startOfToday,
      $lte: endOfToday
    };
  } else {
    // Use provided dates
    if (filters.startDate || filters.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }
  }

  // 2. Driver ID Filter
  if (filters.driverId) {
    matchStage.driver = new mongoose.Types.ObjectId(filters.driverId);
  }

  const result = await Truck.aggregate([
    { $match: matchStage },
    {
      $facet: {
        // Facet 1: Day Wise
        dayWise: [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              totalYardage: { $sum: "$yardage" },
              totalTickets: { $sum: 1 }
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ],
        // Facet 2: Driver Wise
        driverWise: [
          {
            $group: {
              _id: "$driver",
              totalYardage: { $sum: "$yardage" },
              totalTickets: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "driverInfo"
            }
          },
          { $unwind: "$driverInfo" },
          {
            $project: {
              driverId: "$_id",
              driverName: "$driverInfo.name",
              totalYardage: 1,
              totalTickets: 1
            }
          }
        ]
      }
    }
  ]);

  return {
    dayWise: result[0].dayWise || [],
    driverWise: result[0].driverWise || []
  };
};

export const DashboardService = {
  getDashboardStats,
  getDriverTicketsForExport,
  getDriverComparisonStats,
  getUnifiedStats
};
