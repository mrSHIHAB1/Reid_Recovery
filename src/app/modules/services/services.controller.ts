import { Request, Response, NextFunction } from "express";
import { ServicesService } from "./services.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

const createService = catchAsync(async (req: Request, res: Response) => {
  let payload: any = {};

  // 1️⃣ Parse JSON string if sent in 'data'
  if (req.body.data) {
    try {
      payload = JSON.parse(req.body.data);
    } catch (err) {
      throw new AppError(400, "Invalid JSON in 'data' field");
    }
  } else {
    payload = req.body;
  }

  // 2️⃣ Get uploaded files
  const files = req.files as Express.Multer.File[];

  // 3️⃣ Call service function
  const service = await ServicesService.createService(payload, files);

  // 4️⃣ Send response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created successfully",
    data: service,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const service = await ServicesService.getServiceById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service retrieved successfully",
    data: service,
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const services = await ServicesService.getAllServices();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All services retrieved successfully",
    data: services,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const deletedService = await ServicesService.deleteService(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service deleted successfully",
    data: deletedService,
  });
});

export const ServicesController = {
  createService,
  getServiceById,
  getAllServices,
  deleteService,
};
