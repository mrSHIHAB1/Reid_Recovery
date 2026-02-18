import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import bcrypt from "bcrypt";
import { envVars } from "../../config/env";
import { fileUploader } from "../../helpers/fileUpload";
import { generateOtp, verifytheOtp } from "../../utils/otp.util";
import { sendOtpEmail } from "../../utils/email.util";
import { redisClient } from "../../config/redis.config";
import { Truck } from "../Truck/truck.model";

const OTP_EXPIRE = 3 * 60;

const createDriver = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    if (!email || !password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
    }

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(
        password,
        Number(envVars.BCRYPT_SALT_ROUND)
    );

    const user = await User.create({
        email,
        password: hashedPassword,
        role: Role.DRIVER,
        ...rest,
    });

    return user;
};


const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const otp = generateOtp(5);
    await redisClient.setex(`otp:email:${email}`, OTP_EXPIRE, otp);
    await sendOtpEmail({ to: email, otp });

    return otp;
};

// Step 2: Verify OTP
const verifyOtp = async (email: string, otp: string) => {
    const storedOtp = await redisClient.get(`otp:email:${email}`);
    if (!storedOtp || !verifytheOtp(otp, storedOtp)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
    }

    // Optional: Return a temporary flag/token to allow password reset
    // Here, we just delete OTP after verification
    await redisClient.del(`otp:email:${email}`);
    await redisClient.setex(`otp-verified:${email}`, 300, "true");
    return true;
};

// Step 3: Reset Password
const resetPassword = async (email: string, password: string) => {
    const verified = await redisClient.get(`otp-verified:${email}`);
    if (!verified) throw new AppError(400, "OTP not verified");
    await redisClient.del(`otp-verified:${email}`);
    const hashedPassword = await bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUND));
    const user = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
    );

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    return null;
};

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


const updateUser = async (id: string, payload: Partial<IUser>, file?: Express.Multer.File) => {
    let profilePicture: string | undefined;

    if (file) {
        const uploadResult = await fileUploader.uploadToCloudinary(file);
        profilePicture = uploadResult?.secure_url;
        payload.picture = profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true });

    if (!updatedUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return updatedUser;
};

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

    const users = await User.find(query).lean();
    const totalUsers = await User.countDocuments(query);

    // Get the user IDs to filter trucks
    const userIds = users.map(user => user._id);

    // Aggregate to count trucks (tickets) per driver
    const ticketCounts = await Truck.aggregate([
        { $match: { driver: { $in: userIds } } },
        { $group: { _id: "$driver", count: { $sum: 1 } } }
    ]);

    // Create a map for quick lookup: { userId: count }
    const ticketCountMap = ticketCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {} as Record<string, number>);

    // Merge ticket count into user objects
    const data = users.map(user => ({
        ...user,
        totalTickets: ticketCountMap[user._id.toString()] || 0
    }));

    return {
        data: data,
        meta: {
            total: totalUsers
        }
    };
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


export const UserServices = {
    getAllUsers,

    createDriver,
    createadmin,
    updateUser,
    getUserById,
    deleteUser,
    blockUser,
    unblockUser,
    forgotPassword,
    verifyOtp,
    resetPassword

}