import { User } from "../user/user.model";
import { Truck } from "../Truck/truck.model";

export const getDashboardData = async () => {
  const totalDrivers = await User.countDocuments({ role: "DRIVER" });
  const totalTickets = await Truck.countDocuments();
  const todaysYardage = await Truck.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalYardage: { $sum: "$yardage" },
      },
    },
  ]);

  const totalYardage = await Truck.aggregate([
    {
      $group: {
        _id: null,
        totalYardage: { $sum: "$yardage" },
      },
    },
  ]);

  return {
    totalDrivers,
    totalTickets,
    todaysYardage: todaysYardage[0]?.totalYardage || 0,
    totalYardage: totalYardage[0]?.totalYardage || 0,
  };
};