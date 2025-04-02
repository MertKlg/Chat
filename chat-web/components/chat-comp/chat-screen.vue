<template>
  <div class="container border border-left rounded-start rounded-4 p-0 m-0 h-100 position-relative">
    <div class="chat-screen h-100 d-flex flex-column">
      <div class="chat-header p-3 border-bottom">
        <h5 class="m-0">{{ currentUsername }}</h5>
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
          </div>

          <div v-if="message.user_id === profile.userProfile?.user_id"
            class="profile-image-container rounded-circle overflow-hidden ms-2" style="width: 35px; height: 35px;">
            <img :src="config.public.BASE_URL + message.photo" class="profile-image w-100 h-100 object-fit-cover" />
          </div>
        </div>
      </div>

      <!-- Display preview of selected image -->
      <div v-if="selectedFiles && selectedFiles.length > 0" class="selected-image-preview p-2 border-top">
        <div class="d-flex align-items-center">
          <div class="image-preview me-2" style="width: 60px; height: 60px; position: relative;">
            <img :src="selectedFiles[0].preview" class="img-fluid rounded"
              style="width: 100%; height: 100%; object-fit: cover;">
            <button class="btn btn-sm btn-danger position-absolute"
              style="top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; padding: 0; font-size: 10px;"
              @click="removeSelectedImage">×</button>
          </div>
          <button class="btn btn-sm btn-success" @click="sendImage">Send Image</button>
        </div>
      </div>

      <div class="chat-input p-3 border-top">
        <div class="input-group d-flex w-100 align-items-center">
          <!-- Image upload button -->
          <label for="file-upload" class="btn btn-outline-secondary rounded-circle me-2"
            style="width: 40px; height: 40px; padding: 8px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image"
              viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
              <path
                d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
            </svg>
          </label>
          <input id="file-upload" type="file" accept=".png,.jpg,.jpeg" @change="onFileChange" style="display: none">

          <input type="text" v-model="newMessage" placeholder="Write a any message..."
            class="form-control rounded-pill border-0 mx-2 bg-none" @keyup.enter="sendMessage">
          <button class="btn btn-primary rounded-pill" @click="sendMessage">
            <span class="material-symbols-outlined d-flex align-items-center p-0 m-0">
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type IResponse from '~/model/interfaces/iresponse';
import profileStore from '~/store/profile-store';
import { watch, ref, defineProps, nextTick } from "vue"
import toastStore from '~/store/toast-store';

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
const props = defineProps(["chat_info"])
const messages = ref<IMessages[]>([])
const currentUsername = ref("")
var newMessage = ref("")
const toast = toastStore()
const currentChatId = ref<string | null>(null)
const selectedFiles = ref<File[] | null>(null)
const isUploading = ref(false);
const config = useRuntimeConfig();

const updateMessageChatId = ref<string>("")
const newUpdateChatMessage = ref<string>("")

/* JS */
const scrollMessages = () => {
  const getMessagesElement = document.getElementById("chat-messages")
  if (getMessagesElement)
    getMessagesElement.scrollTop = getMessagesElement.scrollHeight
}

/* SOCKET */
watch(() => props.chat_info, (newChat, oldChat) => {
  if (newChat) {
    $socket.off("get_chat_messages_result");
    $socket.off("send_chat_message_result");
    $socket.off("send_chat_image_result");
    $socket.off("join_chat_room");
    $socket.off("edit_chat_message")

    const { chat_id, username } = newChat
    currentUsername.value = username
    currentChatId.value = chat_id
    messages.value = []
    $socket.emit("get_chat_messages", { chat_id: chat_id })
  }
}, { immediate: true })



/* Actions */
const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  const { chat_id, username } = props.chat_info
  $socket.emit("send_chat_message", { chat_id: chat_id, message: newMessage.value })
}

const deleteMessage = (chat_message_id: string) => {
  if (confirm("Are you sure delete this message ?")) {
    $socket.emit("delete_chat_message", { chat_message_id: chat_message_id, chat_id: props.chat_info.chat_id })
  }
}

const editMessage = (chat_message_id: string, oldMessage: string) => {
  if (!updateMessageChatId.value) {
    updateMessageChatId.value = chat_message_id
    newUpdateChatMessage.value = oldMessage
  } else if (newUpdateChatMessage.value != oldMessage) {
    $socket.emit("edit_chat_message", { chat_message_id: chat_message_id, message: newUpdateChatMessage.value, chat_id: props.chat_info.chat_id })
  } else {
    updateMessageChatId.value = ""
    newUpdateChatMessage.value = ""
  }

}



const sendImage = async () => {
  try {
    const { chat_id } = props.chat_info
    if (isUploading.value) return;
    isUploading.value = true;

    // Get chat_id from props or current value
    const checkChatId = chat_id || currentChatId.value;

    if (!checkChatId) {
      toast.error({ title: 'Chat not found', description: 'Please try again' });
      isUploading.value = false;
      return;
    }

    if (!selectedFiles.value || selectedFiles.value.length === 0) {
      toast.error({ title: 'No image selected', description: 'Please select an image first' });
      isUploading.value = false;
      return;
    }

    // Convert files to base64 - RESOLVE the promises
    const imagePromises = selectedFiles.value.map(async (item) => {
      try {
        const base64 = await convertBase64Format(item.file);
        return base64;
      } catch (e) {
        console.error(e);
        return null;
      }
    });

    // Wait for all promises to resolve
    const images = await Promise.all(imagePromises);

    const validImages = images.filter(img => img !== null);

    if (validImages.length <= 0) {
      toast.error({ title: 'Failed to process image', description: 'Please try again' });
      isUploading.value = false;
      return;
    }

    const base64LengthLimit = config.public.FILE_SIZE;
    const isTooLarge = validImages.some(img => img.length > base64LengthLimit);
    if (isTooLarge) {
      toast.error({ title: 'Image too large', description: 'Please select a smaller image.' });
      return;
    }

    toast.warning({ title: 'Uploading image...', description: 'Please wait' });

    // Send to socket - now with resolved base64 strings
    $socket.emit("send_chat_image", { chat_id: defProps.value?.chat_id, images: validImages });
  } catch (e) {
    console.error("Error sending image:", e);
    toast.error({ title: 'Failed to send image', description: 'Please try again' });
  } finally {
    isUploading.value = false;
  }
}

const removeSelectedImage = () => {
  selectedFiles.value = null;
}

const onFileChange = (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  if (files.length <= 1) {
    selectedFiles.value = Array.from(files).map(file => {

      const sanitizedName = `${file.name}`
        .toLowerCase()
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50);

      return {
        file: file,
        preview: URL.createObjectURL(file),
        sanitizedName: sanitizedName
      };
    });

    // Reset the input
    try {
      event.target.value = null;
    } catch (e) {
      console.error("event.target.value = null error", e);
    }

    toast.success({ title: 'Image selected', description: 'Click "Send Image" to upload' });
  } else {
    toast.error({ title: 'Just only select 1 image', description: '' });
    event.target.value = null;
    selectedFiles.value = null;
  }
};

const convertBase64Format = (file: File) => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      console.error("Invalid file object:", file);
      reject(new Error("Invalid file object"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/* Socket listens */

$socket.on("get_chat_messages_result", (response) => {
  try {
    const res = response as IResponse;
    const gettedMessages = res.value as IMessages[];

    if (gettedMessages && Array.isArray(gettedMessages)) {
      messages.value.push(...gettedMessages);
    }

    nextTick(() => {
      scrollMessages();
    });
  } catch (e) {
    console.error("Error processing messages:", e);
  }
});

$socket.on("send_chat_message_result", (response) => {
  try {
    const res = response as IResponse;
    if (res.status == 200) {
      newMessage.value = '';
    } else {
      toast.error({ title: 'Failed to send message', description: res.message || 'Please try again' });
    }
  } catch (e) {
    console.error("Error sending message:", e);
  }
});

$socket.on("send_chat_image_result", (response) => {
  try {
    console.log("Image result : ", response)
    const res = response as IResponse;
    isUploading.value = false;

    console.log(response)

    if (res.status == 200) {
      toast.success({ title: 'Image sent successfully', description: '' });
      selectedFiles.value = null;

      nextTick(() => {
        scrollMessages();
      });
    } else {
      toast.error({ title: 'Failed to send image', description: res.message || 'Please try again' });
    }


  } catch (e) {
    isUploading.value = false;
    console.error("Error processing image upload response:", e);
    toast.error({ title: 'Error processing upload', description: 'Please try again' });
  }
});

$socket.on("edit_chat_message_result", (response) => {
  try {
    const res = response as IResponse
    if (res.status == 200) {
      updateMessageChatId.value = ""
      newUpdateChatMessage.value = ""
    }

    toast.sendToastWithResponse(res)
  } catch (e) {

  }
})


$socket.on("delete_chat_message_result", (response) => {
  try {
    const res = response as IResponse
    if (res.status == 200) {
      toast.sendToastWithResponse(res)
    }
  } catch (e) {

  }
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