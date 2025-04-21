import type IGroupChat from "~/model/interfaces/igroup-chat"
import type IResponse from "~/model/interfaces/iresponse"
import type IUser from "~/model/interfaces/iuser"

interface IChat {
    user_id: number,
    username: string,
    photo: string,
    message: string,
    chat_id: string,
    chat_type : string
}


export const chatStore = defineStore("chatStore", () => {

    const { $socket } = useNuxtApp()

    const chats = reactive<{ privateChat : IChat[], groupChats : IGroupChat[] }>({privateChat : [], groupChats : []})
    
    const get_group_chats_result = (response : any) => {
        try {
            const res = response as IResponse
            const chatResponse = res.value as IGroupChat[]

            console.log(response)
            console.log(chatResponse)

            if (chats.groupChats.length <= 0) {
                chats.groupChats.push(...chatResponse)
                return
            }

            const findRelatedChat = chatResponse.find(e => chats.groupChats.find(d => e.group_id == d.group_id))

            if (!findRelatedChat) {
                return
            }

            chats.groupChats.find(e => e.group_id == findRelatedChat.group_id)!.message = findRelatedChat.message
            
        } catch (e) {
            console.error(e)
        }
    }

    const get_chats_result = (response : any) => {
        try {
            const res = response as IResponse
            const chatResponse = res.value as IChat[]

            if (chats.privateChat.length <= 0) {
                chats.privateChat.push(...chatResponse)
                return
            }

            const findRelatedChat = chatResponse.find(e => chats.privateChat.find(d => e.chat_id == d.chat_id))

            if (!findRelatedChat) {
                return
            }

            chats.privateChat.find(e => e.chat_id == findRelatedChat.chat_id)!.message = findRelatedChat.message
        } catch (e) {
            console.error(e)
        }
    }

    const checkChat = (userId : number | undefined) : number | undefined => {
        if(!userId) return

        const findFriend = chats.privateChat.find(e => e.user_id == userId)?.user_id
        return findFriend
    }

    const emitChat = () => {
        closeListens()

        $socket.emit("get_chats")
        $socket.emit("get_group_chats")

        $socket.on("get_chats_result", get_chats_result)
        $socket.on("get_group_chats_result", get_group_chats_result)
    }

    const closeListens = () => {
        $socket.off("get_chats_result")
        $socket.off("get_group_chats_result")
    }


    const refreshChat = () => emitChat()

    
    return { chats, refreshChat, checkChat, emitChat}
})