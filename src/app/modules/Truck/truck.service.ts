import { Truck, ITruck } from "./truck.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
const TRUCK_IMAGES = [
  "https://drive.google.com/uc?export=view&id=1UoqoKpRa3bogs88HB3rIl0BmfdVoUT8g",
  "https://drive.google.com/uc?export=view&id=1mXXhw9MrqFMIgRGAuLft6EEotaXsOLV1",
  "https://drive.google.com/uc?export=view&id=1PHuXzzPKglJRBeVXurxlpC-d2kqxKNYn"
];

const createTruck = async (payload: ITruck) => {
 const { ticket, date: dateString, truckNo, yardage } = payload;

    // Convert frontend date string to JS Date
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid date format");
    }
 const photo = TRUCK_IMAGES[Math.floor(Math.random() * TRUCK_IMAGES.length)];

    const truck = await Truck.create({
      ticket,
      date: parsedDate,
      truckNo,
      yardage,
      photo
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

const getAllTrucks = async () => {
  const trucks = await Truck.find();
  return trucks;
};

const deleteTruck = async (id: string) => {
  const truck = await Truck.findByIdAndDelete(id);

  if (!truck) {
    throw new AppError(httpStatus.NOT_FOUND, "Truck not found");
  }

  return truck;
};

export const TruckService = {
  createTruck,
  updateTruck,
  getTruck,
  getAllTrucks,
  deleteTruck,
};
