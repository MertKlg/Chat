<template>
    <div>
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
    
</template>

<script setup lang="ts"> 
import { ref } from "vue"
import type IResponse from "~/model/interfaces/iresponse";
import toastStore from "~/store/toast-store";
const props = defineProps(["chat_info"])
const currentChatId = ref<string | null>(null)
const selectedFiles = ref<File[] | null>(null)
const { $socket } = useNuxtApp();
const config = useRuntimeConfig();
const newMessage = ref("")
const isUploading = ref(false);
const toast = toastStore()

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  const { chat_id } = props.chat_info
  $socket.emit("send_chat_message", { chat_id: chat_id, message: newMessage.value })
}


const sendImage = async () => {
  try {
    const { chat_id } = props.chat_info
    if (isUploading.value) return;
    isUploading.value = true;

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

    const imagePromises = selectedFiles.value.map(async (item) => {
      try {
        const base64 = await convertBase64Format(item.file);
        return base64;
      } catch (e) {
        console.error(e);
        return null;
      }
    });

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

    $socket.emit("send_chat_image", { chat_id: chat_id, images: validImages });
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



const send_chat_message_result = (response : any) => {
  try {
    const res = response as IResponse;
    if (res.status == 200) {
      newMessage.value = "";
    } else {
      toast.error({ title: 'Failed to send message', description: res.message || 'Please try again' });
    }
  } catch (e) {
    console.error("Error sending message:", e);
  }
}

const send_chat_image_result = (response : any) => {
  try {
    const res = response as IResponse;
    isUploading.value = false;

    if (res.status == 200) {
      toast.success({ title: 'Image sent successfully', description: '' });
      selectedFiles.value = null;
      newMessage.value = ""

    } else {
      toast.error({ title: 'Failed to send image', description: res.message || 'Please try again' });
    }

  } catch (e) {
    isUploading.value = false;
    console.error("Error processing image upload response:", e);
    toast.error({ title: 'Error processing upload', description: 'Please try again' });
  }
}


$socket.on("send_chat_message_result", send_chat_message_result)
$socket.on("send_chat_image_result", send_chat_image_result)

</script>

<style>

</style>