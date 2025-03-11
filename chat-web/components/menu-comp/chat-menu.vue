<template>
  <div class="col-3 d-flex flex-column h-100">
    <div class="p-2 border-bottom">
      <div class="d-flex justify-content-between">
        <button type="button" class="btn btn-primary w-25" @click="changeComp(CreateChat)">
          <span class="material-symbols-outlined py-2">
            edit_square
          </span>
        </button>
        <button type="button" class="btn w-25 btn-secondary" @click="changeComp(FriendComp)">
          <span class="material-symbols-outlined py-2">
            person
          </span>
        </button>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto p-2">
      <ul class="list-group">
        <li class="list-group-item list-group-item-action" style="cursor: pointer;" v-for="chat in chats"
          @click="changeComp(ChatScreen, { chat_id: chat.chat_id })" :key="chat.chat_id">

          <div>
            <div class="d-flex align-items-center">
              <img :src="BASE_URL + chat.photo" style="
           width: 50px;
           height: 50px;
           overflow: hidden;
           border-radius: 50%;
           " class="rounded-circle" alt="User profile photo" />
              <span class="ms-2 fw-bold">
                {{ chat.username }}
              </span>
            </div>
            <div>
              {{ chat.message }}
            </div>
          </div>
        </li>
      </ul>
    </div>


    <div class="p-2 border-top">
      <div class="d-flex align-items-center" @click="changeComp(Profile)" style="cursor: pointer;">

        <img :src="BASE_URL + profile.userProfile?.photo" style="
          width: 50px;
          height: 50px;
          overflow: hidden;
          border-radius: 50%;
        " class="rounded-circle" alt="User profile photo" />

        <div class="ms-2">
          <h6 class="mb-0">{{ profile.userProfile?.username }}</h6>
          <small>Check your profile</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type IResponse from '~/model/interfaces/iresponse'
import ChatScreen from "@/components/chat-comp/chat-screen.vue";
import CreateChat from "@/components/chat-comp/create-chat.vue";
import FriendComp from "@/components/friend/friend-comp.vue";
import profileStore from '~/store/profile-store';
import Profile from '../profile-comp/profile.vue';
import { BASE_URL, STORAGE } from '~/common/API';

interface IChat {
  users_id: number,
  username: string,
  photo: string,
  message: string,
  chat_id: string
}

const chats = ref<IChat[]>([])
const profile = profileStore()
const { $socket } = useNuxtApp()
const emit = defineEmits(["compChanged"])

$socket.emit("get_chats")

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



const changeComp = (component: any, props: {} = {}) => {
  emit("compChanged", component, props)
}

</script>

<style scoped>
.d-flex.h-100 {
  height: 100vh;
}
</style>