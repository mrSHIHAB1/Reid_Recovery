import { Request, Response, NextFunction } from "express";
import { TruckService } from "./truck.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";

const createTruck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const truck = await TruckService.createTruck(req.body);

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
  const trucks = await TruckService.getAllTrucks();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All trucks retrieved successfully",
    data: trucks,
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

export const TruckController = {
  createTruck,
  updateTruck,
  getTruck,
  getAllTrucks,
  deleteTruck,
};
