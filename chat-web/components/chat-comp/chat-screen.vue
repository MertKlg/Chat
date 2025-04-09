<template>
  <div class="container border border-left rounded-start rounded-4 p-0 m-0 h-100 position-relative">
    <div class="chat-screen h-100 d-flex flex-column">
      <div class="chat-header p-3 border-bottom">
        <h5 class="m-0">{{ currentUsername }}</h5>
      </div>
      <div class="chat-messages flex-grow-1 overflow-auto px-3" id="chat-messages">

        <chat-list-comp 
          :chat_info="props.chat_info"
          :chat_messages="messages"
          :profile="profile"
          :seemedMessage="seemedMessage"
        />

        <!--
        <div v-for="message in messages" :key="message.chat_message_id" :class="{
          'd-flex': true,
          'message': true,
          'mb-3': true,
          'flex-row': message.user_id !== profile.userProfile?.user_id,
          'justify-content-end': message.user_id === profile.userProfile?.user_id,
          'justify-content-start': message.user_id !== profile.userProfile?.user_id
        }">

          <div v-if="message.user_id !== profile.userProfile?.user_id"
            class="profile-image-container rounded-circle overflow-hidden me-2" style="width: 35px; height: 35px;">
            <img :src="config.public.BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
          </div>

          <div class="message-box" :class="{
            'bg-primary text-white': message.user_id === profile.userProfile?.user_id,
            'bg-light': message.user_id !== profile.userProfile?.user_id,
            'rounded': true, 'p-3': true, 'message-sent': message.user_id === profile.userProfile?.user_id, 'message-received': message.user_id !== profile.userProfile?.user_id
          }">
            <div class="message-username fw-bold"
              :class="{ 'text-end': message.user_id === profile.userProfile?.user_id, 'text-start': message.user_id !== profile.userProfile?.user_id }">
              {{ message.username }}
            </div>
            <div class="message-content">
              <div v-if="message.chat_image">
                <img :src="config.public.BASE_URL + message.chat_image" class="img-fluid rounded"
                  style="max-height: 150px; object-fit: cover;">
              </div>

              <div v-if="updateMessageChatId === message.chat_message_id">
                <input type="text" class="form-control border-0 bg-none" v-model="newUpdateChatMessage">
              </div>

              <div v-else>
                {{ message.message }}
              </div>
            </div>
            <div class="message-footer d-flex flex-column justify-content-between align-items-center mt-1">
              <div class="message-time small text-muted">
                {{ message.sended_at }}
              </div>

              <div class="d-flex mt-2 justify-content-end w-100" v-if="message.user_id == profile.userProfile?.user_id">
                <button class="btn btn-light p-0 m-0 border-0 bg-transparent"
                  @click="deleteMessage(message.chat_message_id)">
                  <span class="material-symbols-outlined d-flex align-items-center p-0 m-0 fs-5">
                    delete
                  </span>
                </button>

                <button class="btn btn-light p-0 m-0 border-0 bg-transparent"
                  @click="editMessage(message.chat_message_id, message.message)">
                  <span class="material-symbols-outlined d-flex align-items-center p-0 m-0 fs-5">
                    edit
                  </span>
                </button>
              </div>
            </div>

            <div v-if="message.user_id === profile.userProfile?.user_id">
              <div class="" v-if="seemedMessage.some(e =>
                e.chat_message_id === message.chat_message_id
              )">
                <span style="font-size: 10px;">
                  Seemed
                </span>
              </div>
            </div>



          </div>

          <div v-if="message.user_id === profile.userProfile?.user_id"
            class="profile-image-container rounded-circle overflow-hidden ms-2" style="width: 35px; height: 35px;">
            <img :src="config.public.BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
          </div>
        </div> -->
      </div>

      <!-- Display preview of selected image
      <div v-if="selectedFiles && selectedFiles.length > 0" class="selected-image-preview p-2 border-top">
        <div class="d-flex align-items-center">
          <div class="image-preview me-2" style="width: 60px; height: 60px; position: relative;">
            <img :src="selectedFiles[0].preview" class="img-fluid rounded"
              style="width: 100%; height: 100%; object-fit: cover;">
            <button class="btn btn-sm btn-danger position-absolute"
              style="top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; padding: 0; font-size: 10px;"
              @click="removeSelectedImage">×</button>
          </div>
          <button class="btn btn-sm btn-success" @click="sendImage">Send Image</button>
        </div>
      </div>

      <div class="chat-input p-3 border-top">
        <div class="input-group d-flex w-100 align-items-center">
          <label for="file-upload" class="btn btn-outline-secondary rounded-circle me-2"
            style="width: 40px; height: 40px; padding: 8px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image"
              viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
              <path
                d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
            </svg>
          </label>
          <input id="file-upload" type="file" accept=".png,.jpg,.jpeg" @change="onFileChange" style="display: none">

          <input type="text" v-model="newMessage" placeholder="Write a any message..."
            class="form-control rounded-pill border-0 mx-2 bg-none" @keyup.enter="sendMessage">
          <button class="btn btn-primary rounded-pill" @click="sendMessage">
            <span class="material-symbols-outlined d-flex align-items-center p-0 m-0">
              send
            </span>
          </button>
        </div>
      </div>-->
      <SendMessage :chat_info="props.chat_info"  />
      
    </div> 
  </div>
</template>

<script setup lang="ts">
import type IResponse from '~/model/interfaces/iresponse';
import profileStore from '~/store/profile-store';
import { watch, ref, defineProps, nextTick } from "vue"
import toastStore from '~/store/toast-store';
import type IMessages from '~/model/interfaces/imessages';
import type ISeemedMessage from '~/model/interfaces/iseemed-message';
import ChatListComp from './list/chat-list-comp.vue';
import SendMessage from './actions/send-message.vue';


const profile = profileStore()
const { $socket } = useNuxtApp();
const props = defineProps(["chat_info"])
const messages = ref<IMessages[]>([])
const seemedMessage = ref<ISeemedMessage[]>([])

const currentUsername = ref("")
const toast = toastStore()



/* JS */
const scrollMessages = () => {
  const getMessagesElement = document.getElementById("chat-messages")
  if (getMessagesElement)
    getMessagesElement.scrollTop = getMessagesElement.scrollHeight
}


/* Socket listens */

const get_chat_messages_result = (response : any) => {
  try {
    const res = response as IResponse;

    const convert = res.value as IMessages[]
    messages.value.push(...convert.reverse())

    nextTick(() => {
      scrollMessages();
    });
  } catch (e) {
    console.error("Error processing messages:", e);
  }
}





const get_last_chat_message = (response : any) => {
  try {
    const res = response as IResponse
    const handleMessage = res.value as IMessages[]

    messages.value.push(...handleMessage)

    const { chat_id } = props.chat_info

    $socket.emit("message_seen", { chat_message_id: handleMessage[0].chat_message_id, chat_id: chat_id })

    nextTick(() => {
      scrollMessages();
    });
  } catch (e) {
    console.error(e)
  }
}

const messages_seemed_result = ( response : any ) => {
  try {
    const res = response as IResponse

    const handleMessage = res.value as ISeemedMessage[]
    seemedMessage.value.push(...handleMessage)

  } catch (e) {
    console.error(e)
  }
}



const setupSocketListeners = () => {
  $socket.on("get_chat_messages_result", get_chat_messages_result)
  $socket.on("messages_seemed_result", messages_seemed_result)
  $socket.on("get_last_chat_message", get_last_chat_message)
}

const stopSocketListeners = () => {
  $socket.off("get_chat_messages_result");
  $socket.off("send_chat_message_result");
  $socket.off("send_chat_image_result");
  $socket.off("join_chat_room");
  $socket.off("edit_chat_message");
  $socket.off("get_last_chat_message");
  $socket.off("messages_seemed_result");
  $socket.emit("leave_chat_room", { chat_id: props.chat_info?.chat_id });
}


/* SOCKET */
onMounted(() => setupSocketListeners())

watch(() => props.chat_info, (newChat, oldChat) => {

  if (newChat && newChat.chat_id) {
    const { chat_id } = newChat;
    messages.value = []; 


    $socket.emit("get_chat_messages", { chat_id });
    $socket.emit("join_chat_room", { chat_id });
  }
}, { immediate: true });


onUnmounted(() => {
  stopSocketListeners()
})


</script>

<style scoped>
.chat-messages {
  padding-bottom: 20px;
}

.message-box {
  max-width: 70%;
}

.message-sent .message-box {
  border-radius: 20px 20px 0px 20px;
}

.message-received .message-box {
  border-radius: 20px 20px 20px 0px;
}

.selected-image-preview {
  background-color: #f8f9fa;
}
</style>
