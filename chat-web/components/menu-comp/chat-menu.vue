<template>
  <div class="col-3">
    <div class="d-flex flex-column h-100 positon-relative p-0 m-0">

      <div class="p-2">
        <div class="d-flex justify-content-between">
          <button type="button" class="btn w-100 btn-secondary" @click="changeComp(FriendComp)">
            <span class="material-symbols-outlined py-2">
              person
            </span>
          </button>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <button type="button" class="btn w-100 btn-dark" @click="changeComp(CreateGroup)">
            <span class="material-symbols-outlined py-2">
              create
            </span>
          </button>
        </div>
      </div>

      <div class="flex-grow-1 overflow-auto p-2">
        <ul class="list-group">
          <li class="list-group-item list-group-item-action" style="cursor: pointer;" v-for="chat in chat.chats.privateChat"
            @click="changeComp(ChatScreen, { chat_id: chat.chat_id, title: chat.username, photo: chat.photo, chat_type : chat.chat_type })" :key="chat.chat_id">
            <div>
              <div class="d-flex align-items-center">
                <img :src="config.public.BASE_URL + chat.photo" style="
                width: 50px;
                height: 50px;
                overflow: hidden;
                border-radius: 50%;" class="rounded-circle" alt="User profile photo" />
                <span class="ms-2 fw-bold">
                  {{ chat.username }}
                </span>
              </div>
              <div>
                {{ chat.message }}
              </div>
            </div>
          </li>

          <li class="list-group-item list-group-item-action"
           style="cursor: pointer;"
            v-for="chat in chat.chats.groupChats"
            @click="changeComp(ChatScreen, { chat_id: chat.chat_id, title : chat.group_name, photo : chat.photo, chat_type : chat.chat_type })"
           :key="chat.group_id">
            <div>
              <div class="d-flex align-items-center">
                <img :src="config.public.BASE_URL + chat.photo" style="
                width: 50px;
                height: 50px;
                overflow: hidden;
                border-radius: 50%;" class="rounded-circle" alt="Group photo" />
                <span class="ms-2 fw-bold">
                  {{ chat.group_name }}
                </span>
              </div>
              <div>
                {{ chat.message == null ? 'No message sended' : chat.message }}
              </div>
            </div>
          </li>
        </ul>
      </div>

      


      <div class="p-2 border-top">
        <div class="d-flex align-items-center" @click="changeComp(Profile)" style="cursor: pointer;">

          <img v-if="profile && profile.userProfile && profile.userProfile.photo"
            :src="config.public.BASE_URL + profile.userProfile?.photo" style="
             width: 50px;
             height: 50px;
             overflow: hidden;
             border-radius: 50%;" 
             class="rounded-circle"
              alt="User profile photo" />

          <div class="ms-2">
            <h6 class="mb-0">{{ profile.userProfile?.username }}</h6>
            <small>Check your profile</small>
          </div>
        </div>
      </div>

    </div>
    </div>
</template>

<script lang="ts" setup>
import ChatScreen from "@/components/chat-comp/chat-screen.vue";
import CreateChat from "@/components/chat-comp/create-chat.vue";
import FriendComp from "@/components/friend/friend-comp.vue";
import profileStore from '~/store/profile-store';
import Profile from '../profile-comp/profile.vue';
import { chatStore } from '~/store/chat-store';
import menuStore from "~/store/menu-store";
import CreateGroup from "../chat-group-comp/create-group.vue";

const profile = profileStore()
const chat = chatStore()
const config = useRuntimeConfig();
const emit = defineEmits(["compChanged"])

const changeComp = (component: any, props: {} = {}) => {
  emit("compChanged", component, props)
}

</script>

<style scoped>
.d-flex.h-100 {
  height: 100vh;
}
</style>
