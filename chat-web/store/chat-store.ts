import type IResponse from "~/model/interfaces/iresponse"
import type IUser from "~/model/interfaces/iuser"

interface IChat {
    user_id: number,
    username: string,
    photo: string,
    message: string,
    chat_id: string
}


export const chatStore = defineStore("chatStore", () => {

    const { $socket } = useNuxtApp()

    const chats = ref<IChat[]>([])

    // Get exists user chats
    const getChats = () => {
        emitChat()
        $socket.on("get_chats_result", (response) => {
            try {
                const res = response as IResponse
                const chatResponse = res.value as IChat[]

                if (chats.value.length <= 0) {
                    chats.value = chatResponse
                    return
                }

                const findRelatedChat = chatResponse.find(e => chats.value.find(d => e.chat_id == d.chat_id))

                if (!findRelatedChat) {
                    return
                }

                chats.value.find(e => e.chat_id == findRelatedChat.chat_id)!.message = findRelatedChat.message
            } catch (e) {
                console.error(e)
            }
        })
    }

    const checkChat = (userId : number | undefined) : number | undefined => {
        if(!userId) return

        const findFriend = chats.value.find(e => e.user_id == userId)?.user_id
        return findFriend
    }

    const emitChat = () => {
        $socket.off("get_chats")
        $socket.emit("get_chats")
    }

    const refreshChat = () => emitChat()

    
    return { getChats, chats, refreshChat, checkChat }
})