import { Request, Response, NextFunction } from "express";
import { TruckService } from "./truck.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";

const createTruck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id; 
  console.log("Creating truck for user:", userId);
  const truck = await TruckService.createTruck(req.body,userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Truck created successfully",
    data: truck,
  });
});

const updateTruck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updatedTruck = await TruckService.updateTruck(id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Truck updated successfully",
    data: updatedTruck,
  });
});

const getTruck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const truck = await TruckService.getTruck(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Truck retrieved successfully",
    data: truck,
  });
});

const getAllTrucks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { ticket, date, driverId, driverName, page, limit } = req.query;

  const filters = {
    ticket: ticket as string,
    date: date as string,
    driverId: driverId as string,
    driverName: driverName as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  };

  const result = await TruckService.getAllTrucks(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All trucks retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const deleteTruck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const deletedTruck = await TruckService.deleteTruck(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Truck deleted successfully",
    data: deletedTruck,
  });
});
// const createTruckFromImage = catchAsync(async (req: Request, res: Response) => {
//   const result = await TruckService.createTruckFromImage(req.file as any);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Truck created from image successfully",
//     data: result.truck,
//     meta: {
//       parsed: result.parsed,
//       // remove ocrText in production if you want
//       ocrText: result.ocrText,
//     },
//   });
// });

const getMyTickets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id; // Extract logged-in user's ID
  const result = await TruckService.getTicketsByDriver(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tickets retrieved successfully",
    data: result,
  });
});

export const TruckController = {
  createTruck,
  updateTruck,
  getTruck,
  getAllTrucks,
  deleteTruck,
  // createTruckFromImage,
  getMyTickets,
};
