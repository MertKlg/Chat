<template>
  <div class="col-3 h-100">
    <div class="col">
        <div class="row p-0 m-0 text-center my-2">
          <div class="col border rounded mx-2 d-flex align-items-center justify-content-center" style="cursor: pointer;"
            @click="changeComp(CreateChat)">
            <span class="material-symbols-outlined py-2">
              edit_square
            </span>
          </div>

          <div class="col border position-relative rounded mx-2" style="cursor: pointer;"
            @click="changeComp(FriendComp)">
            <span class="material-symbols-outlined py-2">
              person
            </span>
          </div>
        </div>
      </div>

      <div class="col">
        <ul class="list-group">
          <li class="list-group-item list-group-item-action" v-for="item in chats" :key="item.users_id" style="cursor: pointer;"
            @click="changeComp(ChatScreen, { chat_id: item.chat_id })">
            <div class="row align-items-center">
              <div class="col">
                <span class="material-symbols-outlined ">
                  person
                </span>
              </div>
              <div class="col">
                <h6>{{ item.username }}</h6>
                <p>{{ item.message }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
</template>

<script lang="ts" setup>
import type IResponse from '~/model/interfaces/iresponse'
import ChatScreen from "@/components/chat-comp/chat-screen.vue";
import CreateChat from "@/components/chat-comp/create-chat.vue";
import FriendComp from "@/components/friend/friend-comp.vue";

interface IChat {
  users_id: number,
  username: string,
  message: string,
  chat_id: string
}

const chats = ref<IChat[]>([])

const { $socket } = useNuxtApp()
const emit = defineEmits(["compChanged"])

$socket.emit("get_chats")

$socket.on("get_chats_result", (response) => {
  try {
    const res = response as IResponse
    const chatResponse = res.value as IChat[]

    if(chats.value.length <= 0){
      chats.value = chatResponse
      return
    }

    const findRelatedChat = chatResponse.find(e => chats.value.find(d => e.chat_id == d.chat_id))

    if(!findRelatedChat){
      return
    }

    chats.value.find(e => e.chat_id == findRelatedChat.chat_id)!.message = findRelatedChat.message
  } catch (e) {
    console.error(e)
  }
})



const changeComp = (component : any, props : {} = {}) => {
    emit("compChanged",component, props)
}

</script>

<style>

</style>