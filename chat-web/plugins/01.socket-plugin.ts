import { BASE_URL } from "~/common/API"
import io from "socket.io-client"

export default defineNuxtPlugin((nuxtApp) => {
    const socket = io(BASE_URL, {
        withCredentials : true,
        autoConnect : false
    })


    return {
        provide : {
            socket
        }
    }
})