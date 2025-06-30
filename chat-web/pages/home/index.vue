<template>
  <div class="row m-0 p-0 vh-100">
    <ChatMenu @comp-changed="changeComp" />

    <div class="col p-0 m-0 h-100">
      <component :key="currentComp.props.chat_id || currentComp.component.name" :is="currentComp.component"
        :chat_info="currentComp.props" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { StarterComp } from "#components";
import { ref } from "vue";
import ChatMenu from "~/components/menu-comp/chat-menu.vue";
import { chatStore } from "~/store/chat-store";
import profileStore from "~/store/profile-store";

useHead({
  title: "Chat"
})

const { $socket } = useNuxtApp()
const profile = profileStore()
const chat = chatStore()


onMounted(() => {
  if (profile.userProfile) {
    $socket.open()
    chat.emitChat()
    chat.listeners()
  } else {
    console.log("userProfile mevcut değil, socket açılmıyor.");
  }
})

onUnmounted(() => {
  chat.closeListens()
  $socket.close()
})



const currentComp = ref<{ component: any, props: {} }>({ component: StarterComp, props: {} })
const changeComp = (component: any, props: {}) => {
  currentComp.value = { component, props }
}
</script>
