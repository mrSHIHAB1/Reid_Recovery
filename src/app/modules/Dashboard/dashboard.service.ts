import { Truck } from "../Truck/truck.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";


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

export const DashboardService = {
  getDashboardStats,
};
