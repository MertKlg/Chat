<template>
  <div class="container border border-left rounded-start rounded-4 p-0 m-0 h-100 position-relative">
    <div class="chat-screen h-100 d-flex flex-column">
      <div class="chat-header p-3 border-bottom d-flex align-items-center">
        <img  :src="config.public.BASE_URL + props.chat_info.photo" style="height: 40px; width:40px; overflow: hidden; object-fit: cover;" class="me-2 img-fluid rounded-circle" alt="" />
        <h5 class="m-0">{{ props.chat_info.title }}</h5>
      </div>
      <div class="chat-messages flex-grow-1 overflow-auto px-3" id="chat-messages">

        <chat-list-comp 
          :chat_info="props.chat_info"
          :chat_messages="messages"
          :profile="profile"
          :seemedMessage="seemedMessage"
        />
      </div>
      <SendMessage :chat_info="props.chat_info"  />
    </div> 
  </div>
</template>

<script setup lang="ts">
import type IResponse from '~/model/interfaces/iresponse';
import profileStore from '~/store/profile-store';
import { watch, ref, defineProps, nextTick } from "vue"
import type IMessages from '~/model/interfaces/imessages';
import type ISeemedMessage from '~/model/interfaces/iseemed-message';
import ChatListComp from './list/chat-list-comp.vue';
import SendMessage from './actions/send-message.vue';


const profile = profileStore()
const { $socket } = useNuxtApp();
const props = defineProps(["chat_info"])
const messages = ref<IMessages[]>([])
const seemedMessage = ref<ISeemedMessage[]>([])
const config = useRuntimeConfig()


console.log(props)

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
  $socket.off("get_last_chat_message");
  $socket.off("messages_seemed_result");
  $socket.off("edit_chat_message_result")
  $socket.off("delete_chat_message_result")
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
