import { Server } from "socket.io";
import { socketVerifyUser } from "./middleware/socket-verify-user";
import { webSocketAccessTokenVerify } from "./middleware/socket-token-verify";
import friendSocket from "./friend-socket/friend-socket";
import chatSocket from "./chat-socket";


const appSocket = (io : Server) => {
  io.use(webSocketAccessTokenVerify)
  io.use(socketVerifyUser)

    io.on('connection', (socket) => {

        friendSocket(socket)
        chatSocket(socket)

        socket.on('disconnect', () => {});
      });
}

export default appSocket

