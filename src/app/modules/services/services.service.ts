import { Service, IService } from "./services.model";
import AppError from "../../errorHelpers/AppError";
import { fileUploader } from "../../helpers/fileUpload";
import httpStatus from "http-status-codes";

const createService = async (payload: Partial<IService>, files?: Express.Multer.File[]) => {
  let documentUrls: string[] = [];

  if (files && files.length > 0) {
    documentUrls = await fileUploader.uploadMultipleToCloudinary(files);
  }

  const service = await Service.create({
    ...payload,
    document: documentUrls,
  });

  return service;
};

const getServiceById = async (id: string) => {
  const service = await Service.findById(id);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  return service;
};

const getAllServices = async () => {
  const services = await Service.find();
  return services;
};

const deleteService = async (id: string) => {
  const service = await Service.findByIdAndDelete(id);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  return service;
};

export const ServicesService = {
  createService,
  getServiceById,
  getAllServices,
  deleteService,
};
