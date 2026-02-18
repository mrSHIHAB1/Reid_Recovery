import { Truck, ITruck } from "./truck.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { extractTextFromImageBuffer } from "../../utils/vision";
import { parseTruckFromOcrText } from "./truck.parser";

const TRUCK_IMAGES = [
  "https://drive.google.com/uc?export=view&id=1UoqoKpRa3bogs88HB3rIl0BmfdVoUT8g",
  "https://drive.google.com/uc?export=view&id=1mXXhw9MrqFMIgRGAuLft6EEotaXsOLV1",
  "https://drive.google.com/uc?export=view&id=1PHuXzzPKglJRBeVXurxlpC-d2kqxKNYn"
];

const createTruck = async (payload: ITruck,driverId: string) => {
 const { ticket, date: dateString, truckNo, yardage } = payload;

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

const getAllTrucks = async (filters: { ticket?: string; date?: string; driverId?: string; driverName?: string; page?: number; limit?: number }) => {
  const { ticket, date, driverId, driverName, page = 1, limit = 10 } = filters;

  const query: any = {};

  if (ticket) {
    query.ticket = { $regex: ticket, $options: "i" }; // Case-insensitive search for ticket
  }

  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      query.date = parsedDate;
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid date format");
    }
  }

  if (driverId) {
    query.driver = driverId; // Exact match for driver ID
  }

  if (driverName) {
    query["driver.name"] = { $regex: driverName, $options: "i" }; // Case-insensitive search for driver name
  }

  const skip = (page - 1) * limit;

  const trucks = await Truck.find(query)
    .populate({ path: "driver", select: "name" }) // Populate driver name from User model
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
  deleteTruck,
  // createTruckFromImage,
  getTicketsByDriver,
};
