import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";



const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserServices.createDriver(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const data = await UserServices.forgotPassword(email);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP sent to your email",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const result = await UserServices.verifyOtp(email, otp);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP verified successfully",
      data: result, // could return a temporary token for password reset
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    await UserServices.resetPassword(email, password);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const createAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const user = await UserServices.createadmin(req.body, req.file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: user
  })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Extract filter parameters from query
  const filters = {
    role: req.query.role as string | undefined,
    email: req.query.email as string | undefined,
    contactNumber: req.query.contactNumber as string | undefined,
    searchTerm: req.query.searchTerm as string | undefined,
  };

  const result = await UserServices.getAllUsers(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Users Retrieved Successfully",
    data: result.data,
    meta: result.meta
  })
})
const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = await UserServices.getUserById(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User retrieved',
    data: user,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = await UserServices.deleteUser(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted ',
    data: user,
  });
});



const updateUser = catchAsync(async (req: Request, res: Response) => {

  const id = req.user.id;
  console.log("User ID from token:", id);
  let payload = {};

  // 1️⃣ Parse JSON data if exists
  if (req.body.data) {
    payload = JSON.parse(req.body.data);
  } else {
    payload = req.body;
  }

  const file = req.file;

  const result = await UserServices.updateUser(
    id as string,
    payload,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: result,
  });
});

const updateUserById = catchAsync(async (req: Request, res: Response) => {

  const id = req.params.id;
  let payload = {};

  // 1️⃣ Parse JSON data if exists
  if (req.body.data) {
    payload = JSON.parse(req.body.data);
  } else {
    payload = req.body;
  }

  const file = req.file;

  const result = await UserServices.updateUser(
    id as string,
    payload,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  createDriver,
  createAdmin,
  updateUser,
  updateUserById,
  getUserById,
  deleteUser,
  forgotPassword,
  verifyOtp,
  resetPassword



}