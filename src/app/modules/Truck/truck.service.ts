import { Truck, ITruck } from "./truck.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { extractTextFromImageBuffer } from "../../utils/vision";
import { parseTruckFromOcrText } from "./truck.parser";
import { NotificationType } from "../notification/notification.interface";
import { Notification } from "../notification/notification.model";
import mongoose from "mongoose";

const TRUCK_IMAGES = [
  "https://drive.google.com/uc?export=view&id=1UoqoKpRa3bogs88HB3rIl0BmfdVoUT8g",
  "https://drive.google.com/uc?export=view&id=1mXXhw9MrqFMIgRGAuLft6EEotaXsOLV1",
  "https://drive.google.com/uc?export=view&id=1PHuXzzPKglJRBeVXurxlpC-d2kqxKNYn"
];

const createTruck = async (payload: ITruck, driverId: string) => {
  const { ticket, date: dateString, truckNo, yardage } = payload;
  //  const yardageNum = Number(yardage);
  //  if (isNaN(yardageNum)) {
  //    throw new AppError(httpStatus.BAD_REQUEST, "Yardage must be a number");
  //  }

  // Convert frontend date string to JS Date
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid date format");
  }
  const photo = TRUCK_IMAGES[Math.floor(Math.random() * TRUCK_IMAGES.length)];

  const truck = await Truck.create({
    ticket,
    date: dateString,
    truckNo,
    yardage,
    photo,
    driver: driverId
  });


  const Notificationpayload = {
    user: truck.driver, // ID of the user receiving the notification
    type: NotificationType.SYSTEM, // Type of notification from your enum
    title: "New Ticket Added!",       // Notification title
    body: "A user just scanned a new ticket.", // Notification body
    receiverIds: [truck.driver],

    isRead: false, // Defaults to false, optional
  };
  await Notification.create(Notificationpayload);


  return truck;
};

const updateTruck = async (id: string, payload: Partial<ITruck>) => {
  const updatedTruck = await Truck.findByIdAndUpdate(id, payload, { new: true });

  if (!updatedTruck) {
    throw new AppError(httpStatus.NOT_FOUND, "Truck not found");
  }

  return updatedTruck;
};

const getTruck = async (id: string) => {
  const truck = await Truck.findById(id);

  if (!truck) {
    throw new AppError(httpStatus.NOT_FOUND, "Truck not found");
  }

  return truck;
};


const getAllTrucks = async (filters: {
  ticket?: string;
  date?: string;
  driverId?: string;
  driverName?: string;
  page?: number;
  limit?: number;
}) => {
  const { ticket, date, driverId, driverName, page = 1, limit = 10 } = filters;

  const query: any = {};

  // Ticket filter
  if (ticket && ticket.trim() !== "") {
    query.ticket = { $regex: ticket, $options: "i" };
  }

  // Date filter
  if (date && date.trim() !== "") {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      query.date = parsedDate;
    }
  }

  // Driver ID filter (only if valid)
  if (
    driverId &&
    driverId.trim() !== "" &&
    mongoose.Types.ObjectId.isValid(driverId)
  ) {
    query.driver = driverId;
  }

  const skip = (page - 1) * limit;

  const trucks = await Truck.find(query)
    .populate({ path: "driver", select: "name" })
    .skip(skip)
    .limit(limit);

  const total = await Truck.countDocuments(query);

  return {
    data: trucks,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserAllTrucks = async (  filters: { ticket?: string; date?: string },userId: string) => {
  const { ticket, date } = filters;

  const query: any = {
    driver: userId, 
  };

  if (ticket) {
    query.ticket = { $regex: ticket, $options: "i" };
  }

  if (date) {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const trucks = await Truck.find(query)
    .populate({ path: "driver", select: "name" });

  const total = await Truck.countDocuments(query);

  return {
    data: trucks,
    meta: {
      total,
    },
  };
};

const deleteTruck = async (id: string) => {
  const truck = await Truck.findByIdAndDelete(id);

  if (!truck) {
    throw new AppError(httpStatus.NOT_FOUND, "Truck not found");
  }

  return truck;
};
// const createTruckFromImage = async (file: Express.Multer.File) => {
//   if (!file?.buffer) {
//     throw new Error("Image file is required");
//   }

//   const ocrText = await extractTextFromImageBuffer(file.buffer);

//   const parsed = parseTruckFromOcrText(ocrText);

//   // If you want to store the photo, you should upload it to S3/Cloudinary.
//   // For now, you can keep your random photo logic or store placeholder:
//   const photo = undefined;

//   const truck = await Truck.create({
//     ...parsed,
//     photo,
//   });

//   return { truck, ocrText, parsed };
// };
const getTicketsByDriver = async (driverId: string) => {
  const tickets = await Truck.find({ driver: driverId });
  return tickets;
};

export const TruckService = {
  createTruck,
  updateTruck,
  getTruck,
 getAllTrucks,
  getUserAllTrucks,
  deleteTruck,
  // createTruckFromImage,
  getTicketsByDriver,
};
