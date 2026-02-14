import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";



const createTourist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = await UserServices.createTourist(req.body, req.file);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user
    })
})
const createAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = await UserServices.createadmin(req.body, req.file);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user
    })
})

const createGuide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = await UserServices.createguide(req.body, req.file);

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

const addToWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { tourId } = req.body;
    if (!tourId) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: 'Tour ID is required',
            data: null,
        });
    }
    const user = await UserServices.addToWishlist(userId as string, tourId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Tour added to wishlist',
        data: user,
    });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { tourId } = req.body;
    if (!tourId) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: 'Tour ID is required',
            data: null,
        });
    }
    const user = await UserServices.removeFromWishlist(userId as string, tourId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Tour removed from wishlist',
        data: user,
    });
});

const getWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const wishlist = await UserServices.getWishlist(userId as string);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Wishlist retrieved',
        data: wishlist,
    });
});
const Updatuser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UserServices.updateUser(id as string, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Updated user Successfully",
        data: result
    })
})

export const UserControllers = {
    getAllUsers,
    createTourist,
    createAdmin,
    createGuide,
    Updatuser,
    getUserById,
    deleteUser,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
   
}