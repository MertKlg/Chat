import { BASE_URL } from "~/common/API"
import io from "socket.io-client"

export default defineNuxtPlugin((nuxtApp) => {
    const socket = io(BASE_URL, {
        withCredentials : true,
        autoConnect : true,

        reconnectionDelay : 1000,
        reconnectionDelayMax : 5000,
        timeout : 20000,
        reconnectionAttempts : 5
        
    })


    return {
        provide : {
            socket
        }
    }
})