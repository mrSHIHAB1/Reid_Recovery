import AppError from "../../errorHelpers/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import bcrypt from "bcrypt";
import { envVars } from "../../config/env";
import { fileUploader } from "../../helpers/fileUpload";

const createTourist = async (payload: Partial<IUser>, file?: Express.Multer.File) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already Exist")
    }

    let profilePicture: string | undefined;
    if (file) {
        const uploadResult = await fileUploader.uploadToCloudinary(file);
        profilePicture = uploadResult?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    const user = await User.create({
        email,
        role: 'TOURIST',
        password: hashedPassword,
        picture: profilePicture,
        ...rest
    })
    return user;
}
const createadmin = async (payload: Partial<IUser>, file?: Express.Multer.File) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already Exist")
    }

    let profilePicture: string | undefined;
    if (file) {
        const uploadResult = await fileUploader.uploadToCloudinary(file);
        profilePicture = uploadResult?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    const user = await User.create({
        email,
        role: 'ADMIN',
        password: hashedPassword,
        picture: profilePicture,
        ...rest
    })
    return user;
}
const createguide = async (payload: Partial<IUser>, file?: Express.Multer.File) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already Exist")
    }

    let profilePicture: string | undefined;
    if (file) {
        const uploadResult = await fileUploader.uploadToCloudinary(file);
        profilePicture = uploadResult?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    const user = await User.create({
        email,
        role: 'GUIDE',
        password: hashedPassword,
        picture: profilePicture,
        ...rest
    })
    return user;
}


interface UserFilters {
    role?: string;
    email?: string;
    contactNumber?: string;
    searchTerm?: string;
}

const getAllUsers = async (filters?: UserFilters) => {
    const query: any = { isDeleted: { $ne: true } };

    // Filter by role (e.g., only ADMIN users)
    if (filters?.role) {
        query.role = filters.role;
    }

    // Filter by email (partial match, case-insensitive)
    if (filters?.email) {
        query.email = { $regex: filters.email, $options: 'i' };
    }

    // Filter by contact number (partial match)
    if (filters?.contactNumber) {
        query.phone = { $regex: filters.contactNumber, $options: 'i' };
    }

    // General search term (searches across name, email, phone)
    if (filters?.searchTerm) {
        query.$or = [
            { name: { $regex: filters.searchTerm, $options: 'i' } },
            { email: { $regex: filters.searchTerm, $options: 'i' } },
            { phone: { $regex: filters.searchTerm, $options: 'i' } }
        ];
    }

    const users = await User.find(query);
    const totalUsers = await User.countDocuments(query);

    return {
        data: users,
        meta: {
            total: totalUsers
        }
    };
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
    const updatedUserr = await User.findByIdAndUpdate(id, payload, { new: true });


    if (!updatedUserr) {
        throw new Error('User not found');
    }

    return updatedUserr
};

const getUserById = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const deleteUser = async (id: string) => {
    const user = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const blockUser = async (id: string) => {
    const user = await User.findByIdAndUpdate(id, { isblocked: true }, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const unblockUser = async (id: string) => {
    const user = await User.findByIdAndUpdate(id, { isblocked: false }, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const addToWishlist = async (userId: string, tourId: string) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: tourId } },
        { new: true }
    ).populate('wishlist');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const removeFromWishlist = async (userId: string, tourId: string) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: tourId } },
        { new: true }
    ).populate('wishlist');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const getWishlist = async (userId: string) => {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user.wishlist || [];
};

export const UserServices = {
    getAllUsers,

    createTourist,
    createadmin,
    createguide,
    updateUser,
    getUserById,
    deleteUser,
    addToWishlist,
    removeFromWishlist,
    getWishlist
}