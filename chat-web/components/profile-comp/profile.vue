<template>
    <div class="container h-100">
        <div class="row justify-content-center h-100">
            <div class="col h-100">
                <div class="card h-100 border-0">
                    <div class="card-header">
                        <h4 class="mb-0">{{ profile.userProfile?.username }}'s profile</h4>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-4 w-100 d-flex align-items-center justify-content-center">
                            <div class="profile-image-wrapper position-relative" style="
                  width: 150px;
                  height: 150px;
                  overflow: hidden;
                  border-radius: 50%;
                ">
                                <img :src=" config.public.BASE_URL + profileInformation.user.photo" alt="Profile Image"
                                    class="w-100 h-100 object-fit-cover" />
                                <div class="overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                                    style="cursor: pointer" @click="triggerFileInput">
                                    <div class="text-center text-white">
                                        <span class="material-symbols-outlined">
                                            photo_camera
                                        </span>
                                        <p class="mb-0">Update profile</p>
                                    </div>
                                    <input type="file" accept="image/jpg, image/png, image/jpeg" class="d-none"
                                        ref="fileInput" @change="onFileChange" />
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" v-model="profileInformation.user.username"
                                placeholder="Username" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="profileInformation.user.email"
                                placeholder="Email address" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Phone</label>
                            <input type="text" class="form-control" :value="profileInformation.user.phone"
                                placeholder="Phone number" />
                        </div>

                        <div class="col">
                            <button class="btn btn-success mx-1" @click="updateProfile">
                                Update profile
                            </button>
                            <button class="btn btn-danger mx-1" disabled>
                                Delete profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import profileStore from "~/store/profile-store";
import { reactive, watch } from "vue";
import { clientSideFetch } from "~/common/genericFetch";
import { API_URL, BASE_URL } from "~/common/API";
import type IResponse from "~/model/interfaces/iresponse";
import ResponseModel from "~/model/response-model";
import toastStore from "~/store/toast-store";
import type IUser from "~/model/interfaces/iuser";

const toast = toastStore();
const profile = profileStore();
const config = useRuntimeConfig()

const profileInformation = reactive<{
    user: IUser;
    updatePhoto: File | null;
}>({
    user: {
        username: "",
        email: "",
        phone: "",
        photo: "",
    } as IUser,
    updatePhoto: null,
});

watch(
    () => profile.userProfile,
    (newValue) => {
        if (newValue) {
            profileInformation.user.username = newValue.username;
            profileInformation.user.email = newValue.email;
            profileInformation.user.phone = newValue.phone;
            profileInformation.user.photo = newValue.photo;
        }
    },
    { immediate: true }
);

const updateProfile = async () => {
    try {
        const res = (await clientSideFetch({
            url: `${API_URL}/profile/update`,
            body: {
                username: profileInformation.user.username,
                email: profileInformation.user.email,
                phone: profileInformation.user.phone,
            },
            credentials: "include",
            immediate: false,
            method: "PUT",
        })) as IResponse;

        if (profileInformation.updatePhoto) {
            const formData = new FormData();
            formData.append("photo", profileInformation.updatePhoto);

            const profileRes = (await clientSideFetch({
                url: `${API_URL}/profile/update-photo`,
                body: formData,
                credentials: "include",
                immediate: false,
                method: "PUT",
            })) as IResponse;

            if (profileRes.status !== 200) {
                toast.error({ title: res.message, description: "" });
            }
        }

        if (res.status !== 200) {
            toast.error({ title: res.message, description: "" });
            return;
        }

        toast.success({ title: res.message, description: "" });

        await profile.getProfile();
    } catch (e) {
        if (e instanceof ResponseModel) {
            toast.error({ title: e.message, description: "" });
            return;
        }
        toast.error({ title: "Something went wrong", description: "" });

        console.log(e);
    }
};

const fileInput = ref(null);

const triggerFileInput = () => {
    fileInput.value.click();
};

const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileInformation.user.photo = e.target.result as string;
            profileInformation.updatePhoto = file;
        };
        reader.readAsDataURL(file);
    }
};
</script>

<style scoped>
.profile-image-wrapper .overlay {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.profile-image-wrapper:hover .overlay {
    opacity: 1;
}

.object-fit-cover {
    object-fit: cover;
}
</style>
