import { Types } from "mongoose";

export enum NotificationType {
  TICKET = "TICKET",
  SYSTEM = "SYSTEM",
  SUMMARY = "SUMMARY",
}

export interface INotificationData {
  ticketId?: string;
  deepLink?: string;
}

export interface INotification {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  receiverIds?: Types.ObjectId[];
  data?: INotificationData;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
