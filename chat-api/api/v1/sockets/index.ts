import { Server } from "socket.io";
import { socketVerifyUser } from "./middleware/socket-verify-user";
import { webSocketAccessTokenVerify } from "./middleware/socket-token-verify";
import friendSocket from "./friend-socket/friend-socket";
import chatSocket from "./chat-socket";
import onlineUserPool from "./pool/online-user-pool";


const appSocket = (io : Server) => {
  io.use(webSocketAccessTokenVerify)
  io.use(socketVerifyUser)

    io.on('connection', (socket) => {
        const {users_id} = socket.data.user
        socket.join(users_id)
        onlineUserPool.addUser(users_id, socket.id)

        friendSocket(socket, io)
        chatSocket(socket, io)

        socket.on('disconnect', () => {

        });
      });
}

export default appSocket

