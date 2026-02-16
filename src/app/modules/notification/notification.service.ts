import { Types } from "mongoose";
import { Notification } from "./notification.model";
import { INotificationData, NotificationType } from "./notification.interface";
import { getIo } from "../socket/socket.store";
import { sendPushToTokens } from "../../utils/sendPushNotification";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";

const NOTI_ROOM = (userId: string) => `notification_${userId}`;

// ------------------------------
// SOCKET EMIT
// ------------------------------
const emitNotification = (
  userIds: (string | Types.ObjectId)[],
  payload: any,
) => {
  try {
    const io = getIo();
    userIds.forEach((id) => io.to(NOTI_ROOM(String(id))).emit("notification", payload));
  } catch {}
};

// ------------------------------
// SAVE IN-APP
// ------------------------------
const createInApp = async (
  userIds: Types.ObjectId[],
  type: NotificationType,
  title: string,
  body: string,
  data?: INotificationData,
) => {
  if (!userIds.length) return [];

  const docs = userIds.map((id) => ({
    user: id,
    type,
    title,
    body,
    data,
    isRead: false,
  }));

  return Notification.insertMany(docs);
};

// ------------------------------
// PUSH
// ------------------------------
const pushToUserIds = async (
  userIds: Types.ObjectId[],
  title: string,
  body: string,
  data?: INotificationData,
) => {
  const users = await User.find({ _id: { $in: userIds } }).select("fcmTokens");
  const tokens = users.flatMap((u: any) => u.fcmTokens || []).filter(Boolean);
  if (!tokens.length) return;
  return sendPushToTokens(tokens, title, body, data);
};

// ------------------------------
// CORE NOTIFICATIONS
// ------------------------------

// 1️⃣ Driver submits ticket -> notify all admins
const notifyAdminsTicketSubmitted = async (ticket: any) => {
  const admins = await User.find({ role: Role.ADMIN }).select("_id");
  const adminIds = admins.map((a) => a._id as Types.ObjectId);
  if (!adminIds.length) return;

  const title = "New Ticket Submitted";
  const body = `Ticket #${ticket.ticketNumber} submitted (${ticket.yardage} yd)`;
  const data: INotificationData = { ticketId: String(ticket._id), deepLink: `/tickets/${ticket._id}` };

  await createInApp(adminIds, NotificationType.TICKET, title, body, data);
  await pushToUserIds(adminIds, title, body, data);
  emitNotification(adminIds, { type: NotificationType.TICKET, title, body, data });
};

// 2️⃣ Admin edits ticket -> notify driver
const notifyDriverTicketUpdated = async (ticket: any) => {
  const driverId = ticket.driver;
  const userIds = [new Types.ObjectId(driverId)];

  const title = "Ticket Updated";
  const body = `Your Ticket #${ticket.ticketNumber} was updated by admin.`;
  const data: INotificationData = { ticketId: String(ticket._id), deepLink: `/tickets/${ticket._id}` };

  await createInApp(userIds, NotificationType.TICKET, title, body, data);
  await pushToUserIds(userIds, title, body, data);
  emitNotification(userIds, { type: NotificationType.TICKET, title, body, data });
};

// 3️⃣ Sync failed -> notify driver
const notifyDriverSyncFailed = async (driverId: string) => {
  const userIds = [new Types.ObjectId(driverId)];
  const title = "Sync Failed";
  const body = "Some tickets failed to sync. Please check your connection.";

  await createInApp(userIds, NotificationType.SYSTEM, title, body);
  await pushToUserIds(userIds, title, body);
  emitNotification(userIds, { type: NotificationType.SYSTEM, title, body });
};

// 4️⃣ Daily summary -> notify driver
const notifyDriverDailySummary = async (
  driverId: string,
  totalTickets: number,
  totalYardage: number,
) => {
  const userIds = [new Types.ObjectId(driverId)];
  const title = "Daily Summary";
  const body = `You scanned ${totalTickets} tickets. Total: ${totalYardage} yd`;

  await createInApp(userIds, NotificationType.SUMMARY, title, body);
  await pushToUserIds(userIds, title, body);
  emitNotification(userIds, { type: NotificationType.SUMMARY, title, body });
};

// ------------------------------
// CRUD for Controller
// ------------------------------

const getMyNotifications = async (userId: string, query: Record<string, string>) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const userObjectId = new Types.ObjectId(userId);

  const [data, total] = await Promise.all([
    Notification.find({ user: userObjectId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ user: userObjectId }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data,
  };
};

const markAsRead = async (userId: string, notificationId: string) => {
  await Notification.updateOne({ _id: notificationId, user: userId }, { $set: { isRead: true } });
};

const markAllRead = async (userId: string) => {
  const result = await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
};

const deleteNotification = async (notificationId: string) => {
  return Notification.deleteOne({ _id: notificationId });
};

const getAllNotifications = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Notification.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data,
  };
};

export const NotificationService = {
  notifyAdminsTicketSubmitted,
  notifyDriverTicketUpdated,
  notifyDriverSyncFailed,
  notifyDriverDailySummary,
  getMyNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  getAllNotifications,
};
