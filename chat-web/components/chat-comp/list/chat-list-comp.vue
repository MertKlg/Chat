<template>
  <div>
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
        </div>
  </div>
</template>

<script setup lang="ts">
import type IMessages from '~/model/interfaces/imessages'
import {ref} from "vue"
import toastStore from '~/store/toast-store';
import type IResponse from '~/model/interfaces/iresponse';
import { MessageTypes } from '~/model/enum/emessage-types';

const props = defineProps(["chat_messages","seemedMessage","chat_info" ,"profile", "chat_type"])
const config = useRuntimeConfig()
const { $socket } = useNuxtApp();
const toast = toastStore()

const updateMessageChatId = ref<string>("")
const newUpdateChatMessage = ref<string>("")

const messages = props.chat_messages as IMessages[]

const deleteMessage = (chat_message_id: string) => {
  if (confirm("Are you sure delete this message ?")) {
    $socket.emit("send_chat_message", { chat_message_id: chat_message_id, chat_id: props.chat_info.chat_id, message_type : MessageTypes.delete, chat_type : props.chat_type })
  }
}


const editMessage = (chat_message_id: string, oldMessage: string) => {
  if (!updateMessageChatId.value) {
    updateMessageChatId.value = chat_message_id
    newUpdateChatMessage.value = oldMessage
  } else if (newUpdateChatMessage.value != oldMessage) {
    $socket.emit("send_chat_message", { chat_message_id: chat_message_id, message: newUpdateChatMessage.value, chat_id: props.chat_info.chat_id, message_type : MessageTypes.edit, chat_type : props.chat_type })
  } else {
    updateMessageChatId.value = ""
    newUpdateChatMessage.value = ""
  }
}


const edit_chat_message_result = (response : any) => {
  try {
    const res = response as IResponse
    if(res.status == 200){
        updateMessageChatId.value = ""
        newUpdateChatMessage.value = ""
    }
    toast.sendToastWithResponse(res)
  } catch (e) {

  }
}

const delete_chat_message_result = (response : any) => {
  try {
    const res = response as IResponse
    if (res.status == 200) {
      toast.sendToastWithResponse(res)
    }
  } catch (e) {

  }
}

$socket.on("edit_chat_message_result", edit_chat_message_result)
$socket.on("delete_chat_message_result", delete_chat_message_result)



</script>

<style>

</style>