<template>
  <div class="row m-0 vh-100">
    <ChatMenu @comp-changed="changeComp" />

    <div class="col h-100">
      <component :key="currentComp.props" :is="currentComp.component" :chat_id="currentComp.props" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { StarterComp } from "#components";
import { shallowRef,ref } from "vue";
import ChatScreen from "~/components/chat-comp/chat-screen.vue";
import CreateChat from "~/components/chat-comp/create-chat.vue";
import FriendActions from "~/components/friend/friend-actions.vue";
import ChatMenu from "~/components/menu-comp/chat-menu.vue";
useHead({
  title : "Chat"
})

const { $socket } = useNuxtApp()

if ($socket) {
  $socket.connect();
}

const currentComp = ref<{ component: any, props: {} }>({ component: StarterComp, props: {} })

const changeComp = (component: any, props: {}) => {

  currentComp.value = {component,props}
}
</script>

