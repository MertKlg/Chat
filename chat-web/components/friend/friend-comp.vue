<template>
    <div class="container">

        <div class="btn-toolbar justify-content-center mt-1">
            <div class="btn-group me-2" role="group">
                <button type="button" class="btn btn-outline-primary"
                    :class="showMenu == ShowMenu.friends ? 'active' : ''" @click="showMenu = ShowMenu.friends">
                    <span class="material-symbols-outlined">group</span>
                </button>
                <button type="button" class="btn btn-outline-primary"
                    :class="showMenu == ShowMenu.add_friend ? 'active' : ''" @click="showMenu = ShowMenu.add_friend">
                    <span class="material-symbols-outlined">person_add</span>
                </button>
            </div>
        </div>

        <div v-show="showMenu == ShowMenu.friends">

            <div class="col mt-3">
                <h5 class="fs-4">Friends</h5>
                <div v-if="objects.friends.length < 1">
                    <p>No friends founded</p>
                </div>
                <ul class="list-group w-100" v-else>
                    <li class="list-group-item" v-for="item in objects.friends" :key="item.user_id">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img :src="config.public.BASE_URL + item.photo" class="rounded-circle me-2"
                                    style="width: 40px; height: 40px; object-fit: cover;" />
                                {{ item.username }}
                            </div>
                            <div class="d-flex">
                                <button class="btn btn-primary mx-1 d-flex align-items-center justify-content-center"
                                    @click="createChat(item)" :disabled="chat.checkChat(item.user_id) != undefined">
                                    <span class="material-symbols-outlined">
                                        chat_add_on
                                    </span>
                                </button>
                                <button class="btn btn-danger d-flex align-items-center justify-content-center"
                                    @click="setFriendRequest(item, FriendStatus.Unfriend)">
                                    <span class="material-symbols-outlined p-0">
                                        remove
                                    </span>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div v-show="showMenu == ShowMenu.add_friend">

            <div class="d-flex align-items-center justify-content-center">
                <input v-model="search" name="search" class="form-control"
                id="search" type="text" aria-placeholder="search" placeholder="Search" />
                <button class="btn btn-primary mx-1" @click="searchQuery()">Search</button>
            </div>

            <div class="mt-3">
                <h5>Friend requests</h5>
                <ul class="list-group"
                    v-if="objects.getFriendRequests && objects.getFriendRequests.length > 0 && objects.showFriendsRequest">
                    <li class="list-group-item" v-for="item in objects.getFriendRequests" :key="item.user_id">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <img :src="config.public.BASE_URL + item.photo" class="rounded-circle me-2"
                                    style="width: 40px; height: 40px; object-fit: cover;" />
                            </div>

                            <div>
                                {{ item.username }}
                            </div>

                            <div class="d-flex">
                                <button class="btn btn-success mx-1"
                                    @click="setFriendRequest(item, FriendStatus.Accepted)">
                                    Accept
                                </button>

                                <button class="btn btn-danger mx-1"
                                    @click="setFriendRequest(item, FriendStatus.Rejected)">
                                    Reject
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>

                <div v-else>
                    <p>No founded friend requests</p>
                </div>
            </div>

            <div class="mt-2" v-if="objects.searchedFriends && objects.searchedFriends.length > 0">
                <h5 class="mt-2">Results</h5>
                <ul class="list-group">
                    <li class="list-group-item" v-for="item in objects.searchedFriends" :key="item.user_id">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <img :src="config.public.BASE_URL + item.photo" class="rounded-circle me-2"
                                    style="width: 40px; height: 40px; object-fit: cover;" />
                                {{ item.username }}
                            </div>
                            <button class="btn btn-success d-inline-flex" @click="sendFriendRequest(item, FriendStatus.Waiting)"
                                :disabled="(item.status == FriendStatus.Waiting || item.status === FriendStatus.Accepted)">
                                <span class="material-symbols-outlined pe-2">
                                    person_add
                                </span>
                                Add friend
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Form, Field, ErrorMessage, configure, cleanupNonNestedPath } from "vee-validate"
import * as yup from "yup"
import IUser from '~/model/interfaces/iuser';
import type IResponse from '~/model/interfaces/iresponse';
import toastStore from '~/store/toast-store';
import { chatStore } from '~/store/chat-store';
import type {IFriend } from '~/model/friend-model';
import {FriendStatus} from '~/model/friend-model';

/* Interfaces  */
enum ShowMenu {
    friends = "friends",
    add_friend = "add_friends"
}

/* Varaibles and injects  */
const { $socket } = useNuxtApp()
const search = ref<string>("")
const showResult = ref<boolean>(false)
const toast = toastStore()
const showMenu = ref<string>(ShowMenu.friends)
const config = useRuntimeConfig()
const objects = reactive<{
    searchedFriends: IFriend[],
    friends: IFriend[],
    getFriendRequests: IUser[],
    showFriendsRequest: boolean

}>({ searchedFriends: [], friends: [], getFriendRequests: [], showFriendsRequest: true })
const chat = chatStore()

const validator = yup.object({
    username: yup.string()
        .required("Username required")
})


const requests = () => {
    $socket.emit("get_friends")
    $socket.emit("get_friend_requests") 
}

const listeners = () => {
    $socket.on("search_user_result", searchUserResult)
    $socket.on("get_friends_result", getFriendsResult)
    $socket.on("friend_request_result", friendRequestResult)
    $socket.on("update_friend_request_result", updateFriendRequestResult)
    $socket.on("friend_request_getted_result", friendRequestGettedResult)
    $socket.on("create_chat_result", createChatResult)
    $socket.on("get_friend_requests_result", getFriendRequestsResult)
}

/* Setup  */
onMounted(() => {
    requests()
    listeners()
}) 

onUnmounted(() => {
    $socket.off("search_user_result")
    $socket.off("get_friends_result")
    $socket.off("friend_request_result")
    $socket.off("update_friend_request_result")
    $socket.off("friend_request_getted_result")
    $socket.off("create_chat_result")
    $socket.off("get_friend_requests_result")
})


watch(search, (newValue) => {
    showResult.value = newValue.length > 0
})

/* ACTIONS  */
const searchQuery = () => {
    $socket.emit("search_user", { username: search.value.trim() })
}

const sendFriendRequest = (user: IUser, status : FriendStatus) => {
    $socket.emit("friend_request", { receiver_id: user.user_id, status : status })
}

const setFriendRequest = (user: IUser, status: FriendStatus) => {
    $socket.emit('update_friend_request', { sender_id: user.user_id, friend_status_type : status })
}

const createChat = (user: IUser) => {
    $socket.emit("create_chat", { "to_user_id": user.user_id });
}


/* SOCKET LISTENINGS */
const searchUserResult = (response: any) => {
    try {
        const res = response as IResponse

        objects.searchedFriends = res.value as IFriend[]
    } catch (e) {
        console.error(e)
    }
}


const getFriendsResult = (response: any) => {
    try {
        const res = response as IResponse
        objects.friends = []
        objects.friends.push(...res.value)
    } catch (e) {
        console.error(e)
    }
}

const friendRequestResult = (response: any) => {
    try {
        const res = response as IResponse
        if(res.status === 200){
            console.log(res.value)
            if(Array.isArray(res.value) && res.value.length > 0){
                const getReceiverId = JSON.parse(JSON.stringify(res.value))
                const result = objects.searchedFriends.findIndex(e => getReceiverId.map(d => e.user_id == d["receiver_id"]))
                objects.searchedFriends.splice(result, 1)
                
            }
        }

        toast.sendToastWithResponse(res)

    } catch (e) {
        console.error(e)
    }
}

const updateFriendRequestResult = (response: any) => {
    try {
        const res = response as IResponse

        if(res.status === 200){
            objects.friends = []
            chat.emitChat()
            requests()
        }

        toast.sendToastWithResponse(res)
    } catch (e) {
        console.error(e)
    }
}

const getFriendRequestsResult = (response : any) => {
try {
        const res = response as IResponse

        console.log(res.value)

        objects.getFriendRequests = (res.value as IUser[])
    } catch (e) {
        console.error(e)
    }
}

const friendRequestGettedResult = (response : any) => {
    try {
        const res = response as IResponse

        toast.sendToastWithResponse(res)
    } catch (e) {
        console.error(e)
    }
}

const createChatResult = (response : any) => {
    try {
        const res = response as IResponse
        if(res.status === 200){
            chat.emitChat()
        }
        toast.sendToastWithResponse(res)
    } catch (e) {
        console.error(e)
    }
}

/* END */

</script>


<style scoped></style>
