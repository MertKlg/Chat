import { Socket } from "socket.io";
import IMessage from "../model/interface/IMessage";

export const v1ChatMessageSocket = (socket: Socket) => {
    
    socket.on("chatMessage", (msg) => {
        const message = msg as IMessage
        
        socket.emit("chatMessage", msg)
    });

}