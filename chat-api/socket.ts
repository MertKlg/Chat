import { Server, Socket } from "socket.io";
import http from "http";
import { v1ChatMessageSocket } from "./api/v1/sockets/chat-message-socket";

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {

    v1ChatMessageSocket(socket)


    socket.on("disconnect", () => {
      console.log("disconnected from user");
    });
  });
};
