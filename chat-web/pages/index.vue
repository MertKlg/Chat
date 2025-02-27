<template>
  <div class="row m-0">
    <div class="col-3">
      <div class="col">
        <div class="row p-0 m-0 text-center my-2">
          <div class="col border rounded mx-2 d-flex align-items-center justify-content-center" style="cursor: pointer;" @click="changeComp(CreateChat)">
            <span class="material-symbols-outlined py-2" >
              edit_square
            </span>
          </div>

          <div class="col border position-relative rounded mx-2" style="cursor: pointer;" @click="changeComp(FriendComp)">
            <span class="material-symbols-outlined py-2">
              person
            </span>
          </div>
        </div>
      </div>

      <div class="col">
        <ul class="list-group">
          <li class="list-group-item" v-for="item in chats" :key="item.users_id" style="cursor: pointer;" @click="changeComp(ChatScreen, {chat_id : item.chat_id})">
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

    <div class="col">
      <component :is="currentComp.component" v-bind="currentComp.props" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { StarterComp } from "#components";
import { ref} from "vue";
import ChatScreen from "~/components/chat-comp/chat-screen.vue";
import CreateChat from "~/components/chat-comp/create-chat.vue";
import FriendComp from "~/components/friend/friend-comp.vue";
import type IResponse from "~/model/response";

interface IChat{
  users_id : number,
  username : string,
  message : string,
  chat_id : string
}

const chats = ref<IChat[]>([])

const currentComp = ref<{component : any, props : {}}>({component : StarterComp, props : {}})

const {$socket} = useNuxtApp()

onMounted(() => {

  $socket.emit("get_chats")

    console.log("🔗 Connecting to socket...");
    
    if ($socket) {
        $socket.connect();
    } else {
        console.error("❌ Socket is undefined!");
    }
});

$socket.on("get_chats_result", (response) => {
  try{
    chats.value = []
    const res = response as IResponse
    chats.value = res.value as IChat[]

  }catch(e){
    console.error(e)
  }
})


const changeComp = ( component : any, props : {} = {}) => {
  currentComp.value.component = component
  currentComp.value.props = props

  console.log(currentComp.value)
}
</script>
