<template>
    <div class="container chat-screen">
        <div class="d-flex flex-column w-100 h-100">
            <div class="chat-messages flex-grow-1 overflow-auto" id="chat-messages">
                <div v-for="message in messages" :key="message.chat_message_id" class="message"
                    :class="{ 'message-sent': message.user_id === profile.userProfile?.users_id, 'message-received': message.user_id !== profile.userProfile?.users_id }">
                    <div class="border-bottom mb-2 d-flex align-items-center">
                        <span class="material-symbols-outlined">
                            person
                        </span>
                        <div class="ms-2">
                            {{ message.username }}
                        </div>
                    </div>

                    <div class="message-content">
                        {{ message.message }}
                    </div>
                    <div class="message-time">
                        {{ message.sended_at }}
                    </div>
                </div>
            </div>

            <div class="chat-input">
                <input type="text" v-model="newMessage" placeholder="Type...." class="form-control"
                    @keyup.enter="sendMessage" />
                <button class="btn btn-primary" @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChatCompChatScreen } from '#components';
import { object } from 'yup';
import type IResponse from '~/model/interfaces/iresponse';
import profileStore from '~/store/profile-store';
import {watch} from "vue"

interface IMessages {
    username: string,
    chat_message_id: string,
    message: string,
    user_id: number,
    sended_at: string
}

const profile = profileStore()
const { $socket } = useNuxtApp();
const props = defineProps(["chat_id"])
const messages = ref<IMessages[]>([])
var newMessage = ref("")



/* JS */
const scrollMessages = () => {
    const getMessagesElement = document.getElementById("chat-messages")
    if(getMessagesElement)
        getMessagesElement.scrollTop = getMessagesElement.scrollHeight
}

/* SOCKET */

// TODO : If user change chat, we need update messages array
watch(props.chat_id, (newChatId, oldChatId) => {
    console.log(newChatId, oldChatId)
    messages.value = []
    $socket.emit("join_chat_room", { chat_id: props.chat_id })
    $socket.emit("get_chat_messages", { chat_id: props.chat_id })
})





$socket.on("get_chat_messages_result", (response) => {
    try {
        const res = response as IResponse
        const gettedMessages = res.value as IMessages[]

        messages.value.push(...gettedMessages)

        nextTick(() => {
            scrollMessages()
        })
    } catch (e) {
        console.error(e)
    }
})


const sendMessage = () => {
    $socket.emit("send_chat_message", { chat_id: props.chat_id, message: newMessage.value })
}

$socket.on("send_chat_message_result", (response) => {
    try {
        const res = response as IResponse
        if (res.status == 200) {
            newMessage.value = ""
        }
    } catch (e) { }
})


</script>

<style scoped>
.chat-screen {
    height: 600px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
}

.chat-messages {

    overflow-y: auto;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
}

.message {
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 10px;
    max-width: 70%;
    word-wrap: break-word;
    display: flex;
    flex-direction: column;
}

.message-sent {
    background-color: #DCF8C6;
    align-self: flex-end;
}

.message-received {
    background-color: #ECECEC;
    align-self: flex-start;
}

.chat-input {
    display: flex;
    gap: 10px;
}

.chat-input input {
    flex-grow: 1;
}

.message-time {
    font-size: 0.75rem;
    color: gray;
    text-align: right;
}
</style>
