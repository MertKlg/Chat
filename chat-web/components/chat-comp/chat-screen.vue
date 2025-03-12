<template>
    <div class="container h-100">
      <div class="chat-screen h-100 d-flex flex-column">
        <div class="chat-header bg-light p-3 border-bottom">
          <h5 class="m-0">Chat</h5>
        </div>
        <div class="chat-messages flex-grow-1 overflow-auto px-3" id="chat-messages">
          <div v-for="message in messages" :key="message.chat_message_id"
               :class="{ 'd-flex': true, 
               'message': true,
                'mb-3': true, 
                 'flex-row': message.user_id !== profile.userProfile?.users_id, 
                 'justify-content-end': message.user_id === profile.userProfile?.users_id,
                  'justify-content-start': message.user_id !== profile.userProfile?.users_id 
                  }">
  
            <div v-if="message.user_id !== profile.userProfile?.users_id" class="profile-image-container rounded-circle overflow-hidden me-2" style="width: 35px; height: 35px;">
              <img :src=" BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
            </div>
  
            <div class="message-box"
                 :class="{ 'bg-primary text-white': message.user_id === profile.userProfile?.users_id,
                  'bg-light': message.user_id !== profile.userProfile?.users_id,
                   'rounded': true, 'p-3': true, 'message-sent': message.user_id === profile.userProfile?.users_id, 'message-received': message.user_id !== profile.userProfile?.users_id }">
              <div class="message-username fw-bold"
                   :class="{ 'text-end': message.user_id === profile.userProfile?.users_id, 'text-start': message.user_id !== profile.userProfile?.users_id }">
                {{ message.username }}
              </div>
              <div class="message-content">
                {{ message.message }}
              </div>
              <div class="message-time small text-muted"
                   :class="{ 'text-end': message.user_id === profile.userProfile?.users_id, 'text-start': message.user_id !== profile.userProfile?.users_id }">
                {{ message.sended_at }}
              </div>
            </div>
  
            <div v-if="message.user_id === profile.userProfile?.users_id" class="profile-image-container rounded-circle overflow-hidden ms-2" style="width: 35px; height: 35px;">
              <img :src=" BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
            </div>
          </div>
        </div>
        <div class="chat-input p-3 border-top">
          <div class="input-group">
            <input type="text" v-model="newMessage" placeholder="Mesaj yaz..." class="form-control rounded-pill border-0 bg-light"
                   @keyup.enter="sendMessage">
            <button class="btn btn-primary rounded-pill" @click="sendMessage">Gönder</button>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup lang="ts">
import type IResponse from '~/model/interfaces/iresponse';
import profileStore from '~/store/profile-store';
import { watch } from "vue"
import { BASE_URL } from '~/common/API';

interface IMessages {
    username: string,
    chat_message_id: string,
    message: string,
    user_id: number,
    sended_at: string,
    photo : string
}

const profile = profileStore()
const { $socket } = useNuxtApp();
const props = defineProps(["chat_id"])
const messages = ref<IMessages[]>([])
var newMessage = ref("")


/* JS */
const scrollMessages = () => {
    const getMessagesElement = document.getElementById("chat-messages")
    if (getMessagesElement)
        getMessagesElement.scrollTop = getMessagesElement.scrollHeight
}

/* SOCKET */
watch(props.chat_id, (newChat, oldChat) => {
    const { chat_id } = newChat
    messages.value = []
    $socket.emit("join_chat_room", { chat_id: chat_id })
    $socket.emit("get_chat_messages", { chat_id: chat_id })
}, { immediate: true })

$socket.on("get_chat_messages_result", (response) => {
    try {
        const res = response as IResponse
        const gettedMessages = res.value as IMessages[]

        if(Array.isArray(gettedMessages)){
          messages.value.push(...gettedMessages)
        }else{
          messages.value.push(gettedMessages)
        }
        nextTick(() => {
            scrollMessages()
        })
    } catch (e) {
        console.error(e)
    }
})


const sendMessage = () => {
    const { chat_id } = props.chat_id
    $socket.emit("send_chat_message", { chat_id: chat_id, message: newMessage.value })
}

$socket.on("send_chat_message_result", (response) => {
    try {
      console.log(response)
        const res = response as IResponse
        if (res.status == 200) {
            newMessage.value = ""
        }
    } catch (e) { }
})


</script>

<style scoped>
.chat-messages {
  padding-bottom: 20px; /* Input alanının mesajları kapatmaması için */
}

.message-box {
  max-width: 70%; /* Mesaj kutularının çok genişlemesini engelle */
}

.message-sent .message-box {
  border-radius: 20px 20px 0px 20px; 
}

.message-received .message-box {
  border-radius: 20px 20px 20px 0px; 
}
</style>
