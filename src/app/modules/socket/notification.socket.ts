import { Server, Socket } from "socket.io";

export const notificationSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(" [Notification] client connected:", socket.id);

    socket.on("join-notification", (userId: string) => {
      socket.join(`notification_${userId}`);
      console.log(` ${socket.id} joined room: notification_${userId}`);
    });

    socket.on("leave-notification", (userId: string) => {
      socket.leave(`notification_${userId}`);
      console.log(`🚪 ${socket.id} left room: notification_${userId}`);
    });

    socket.on("join-task", (taskId: string) => {
      socket.join(`task_${taskId}`);
      console.log(` ${socket.id} joined room: task_${taskId}`);
    });

    socket.on("leave-task", (taskId: string) => {
      socket.leave(`task_${taskId}`);
      console.log(`🚪 ${socket.id} left room: task_${taskId}`);
    });

    socket.on("join-ticket", (ticketId: string) => {
      socket.join(`ticket_${ticketId}`);
      console.log(` ${socket.id} joined room: ticket_${ticketId}`);
    });

    socket.on("leave-ticket", (ticketId: string) => {
      socket.leave(`ticket_${ticketId}`);
      console.log(`🚪 ${socket.id} left room: ticket_${ticketId}`);
    });

    socket.on("disconnect", () => {
      console.log(" [Notification] disconnected:", socket.id);
    });
  });
};
