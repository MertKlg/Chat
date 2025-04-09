<template>
  <div class="row m-0 p-0 vh-100">
    <ChatMenu 
    @comp-changed="changeComp"
     />

    <div class="col p-0 m-0 h-100 positon-relative">
      <button class="d-lg-none">Open Menu</button>
      <component 
      :key="currentComp.props.chat_id || currentComp.component.name"
       :is="currentComp.component" 
       :chat_info="currentComp.props"
       />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { StarterComp } from "#components";
import { ref } from "vue";
import ChatMenu from "~/components/menu-comp/chat-menu.vue";
import ResponseModel from "~/model/response-model";
import toastStore from "~/store/toast-store";
useHead({
  title : "Chat"
})

const { $socket } = useNuxtApp()
const toast = toastStore()

if ($socket) {
  $socket.connect();
}

const currentComp = ref<{ component: any, props: {} }>({ component: StarterComp, props: {} })

const changeComp = (component: any, props: {}) => {
  currentComp.value = {component,props}
}


$socket.on("notification_channel", (response) => {
  try{
    const res = response as ResponseModel
    toast.sendToastWithResponse(res)
  }catch(e){
    if(e instanceof Error){
      const res = new ResponseModel(e.message ?? "Something went wrong", 500)
      toast.sendToastWithResponse(res)
      return
    }

    const res = new ResponseModel("Something went wrong", 500)
    toast.sendToastWithResponse(res)
  }
})
</script>

