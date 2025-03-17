<template>
  <div class="container h-100 position-relative">
    <div class="chat-screen h-100 d-flex flex-column">
      <div class="chat-header bg-light p-3 border-bottom">
        <h5 class="m-0">Chat</h5>
      </div>
      <div class="chat-messages flex-grow-1 overflow-auto px-3" id="chat-messages">

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
            <img :src="BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
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
                <img :src=" BASE_URL + message.chat_image" class="img-fluid rounded" style="max-height: 150px; object-fit: cover;">
              </div>
              {{ message.message }}
            </div>
            <div class="message-time small text-muted"
              :class="{ 'text-end': message.user_id === profile.userProfile?.user_id, 'text-start': message.user_id !== profile.userProfile?.user_id }">
              {{ message.sended_at }}
            </div>
          </div>

          <div v-if="message.user_id === profile.userProfile?.user_id"
            class="profile-image-container rounded-circle overflow-hidden ms-2" style="width: 35px; height: 35px;">
            <img :src="BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
          </div>
        </div>
      </div>
      <div class="chat-input p-3 border-top">
        <div class="input-group d-flex w-100 align-items-center">
          <input type="file" accept="image/jpg, image/png, image/jpeg" class="d-none" multiple ref="fileInput"
            @change="onFileChange" />
          <button class="btn rounded-pill border mx-1 d-flex align-items-center" @click="$refs.fileInput.click()">
            <span class="material-symbols-outlined">
              add
            </span>
          </button>

          <input type="text" v-model="newMessage" placeholder="Mesaj yaz..."
            class="form-control rounded-pill border-0 bg-light mx-1" @keyup.enter="sendMessage">
          <button class="btn btn-primary rounded-pill" @click="sendMessage">Send</button>
        </div>
      </div>
    </div>

    <div v-if="selectedFiles != null"
      class="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow z-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="m-0">Selected Images</h5>
        <button class="btn-close" @click="selectedFiles = null"></button>
      </div>
      <div class="row">
        <div v-for="(file, index) in selectedFiles" :key="index" class="col-4 mb-3">
          <img :src="file.preview" class="img-fluid rounded" style="max-height: 150px; object-fit: cover;" />
        </div>
      </div>
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary" @click="sendImage()">Send</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type IResponse from '~/model/interfaces/iresponse';
import profileStore from '~/store/profile-store';
import { watch, ref, defineProps, nextTick } from "vue"
import { BASE_URL } from '~/common/API';

interface IMessages {
  username: string,
  chat_message_id: string,
  message: string,
  user_id: number,
  sended_at: string,
  photo: string,
  chat_image: string
}

const profile = profileStore()
const { $socket } = useNuxtApp();
const props = defineProps(["chat_id"])
const messages = ref<IMessages[]>([])
var newMessage = ref("")
const selectedFiles = ref<File[] | null>()


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

    if (gettedMessages && Array.isArray(gettedMessages)) {
      messages.value.push(...gettedMessages)
    }
    
    nextTick(() => {
      scrollMessages()
    })
  } catch (e) {
    console.error(e)
  }
})

$socket.on("send_chat_message_result", (response) => {
  try {
    console.log(response)
    const res = response as IResponse
    if (res.status == 200) {
      newMessage.value = ""
    }
  } catch (e) { }
})

/* Actions */
const sendMessage = () => {
  const { chat_id } = props.chat_id
  $socket.emit("send_chat_message", { chat_id: chat_id, message: newMessage.value, images: selectedFiles.value })
}

const sendImage = async () => {
  try {
    const { chat_id } = props.chat_id

    if (!selectedFiles.value) {
      return
    }

    const images = await Promise.all(selectedFiles.value.map(e => convertBase64Format(e)))

    if (images.length <= 0) {
      return
    }

    $socket.emit("send_chat_image", { chat_id: chat_id, images })

    selectedFiles.value = null
  } catch (e) {
    console.error(e)
  }
}


const onFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (files.length <= 3) {
    selectedFiles.value = files.map(file => {
      file.preview = URL.createObjectURL(file);
      return file;
    });
  } else {
    alert("You must select 3 files")
    event.target.value = null
    selectedFiles.value = null
  }
}

const convertBase64Format = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  })
}
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
</style>
