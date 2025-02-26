import { Server } from "socket.io";
import { socketVerifyUser } from "./middleware/socket-verify-user";
import { webSocketAccessTokenVerify } from "./middleware/socket-token-verify";
import friendSocket from "./friend-socket/friend-socket";
import chatSocket from "./chat-socket";


const appSocket = (io : Server) => {
  io.use(webSocketAccessTokenVerify)
  io.use(socketVerifyUser)

    io.on('connection', (socket) => {
      const {users_id , username, email, phone} = socket.data.user

        socket.join(users_id)

        console.log("a user connected ! ", users_id)

        friendSocket(socket)
        chatSocket(socket)

        socket.on('disconnect', () => {
          console.log('Bir kullanıcı ayrıldı: ' + socket.id, users_id);
        });
      });
}

export default appSocket

