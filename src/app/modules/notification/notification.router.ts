import { Router } from "express";
import { Role } from "../user/user.interface";
import { NotificationController } from "./notification.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

// ------------------------------------
// USER ROUTES
// ------------------------------------

// GET /notifications/me -> fetch logged-in user's notifications
router.get(
  "/me",
  checkAuth(...Object.values(Role)), // all roles
  NotificationController.myNotifications,
);

// PATCH /notifications/read/:notificationId -> mark single notification as read
router.patch(
  "/read/:notificationId",
  checkAuth(...Object.values(Role)),
  NotificationController.markRead,
);

// PATCH /notifications/read-all -> mark all notifications as read
router.patch(
  "/read-all",
  checkAuth(...Object.values(Role)),
  NotificationController.markAllRead,
);

// DELETE /notifications/delete/:id -> delete a notification
router.delete(
  "/delete/:id",
  checkAuth(...Object.values(Role)),
  NotificationController.deleteNotificationController,
);

// ------------------------------------
// ADMIN ROUTES
// ------------------------------------

// GET /notifications/all -> fetch all notifications (Admin only)
router.get(
  "/all",
  checkAuth(Role.ADMIN),
  NotificationController.getAllNotifications,
);

export const notificationRoutes = router;
