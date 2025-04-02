import { Server } from "socket.io";
import { socketVerifyUser } from "./middleware/socket-verify-user";
import { webSocketAccessTokenVerify } from "./middleware/socket-token-verify";
import friendSocket from "./friend-socket/friend-socket";
import chatSocket from "./chat-socket";


const appSocket = (io : Server) => {
  io.use(webSocketAccessTokenVerify)
  io.use(socketVerifyUser)

    io.on('connection', (socket) => {
        const {user_id} = socket.data.user
        socket.join(user_id)

        friendSocket(socket, io)
        chatSocket(socket, io)

        socket.on('disconnect', () => {
          
        });
      });
}

export default appSocket

