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
                    <li class="list-group-item" v-for="item in objects.friends" :key="item.users_id">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                {{ item.username }}
                            </div>
                            <button class="btn btn-danger" @click="setFriendRequest(item, EFriendStatus.REJECT)">
                                Remove
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div v-show="showMenu == ShowMenu.add_friend">

            <input v-model="search" @input="searchQuery" @focus="objects.showFriendsRequest = false, showResult = true"
            @blur="showResult = false, search = ''"
                 name="search"
                class="form-control" id="search" type="text" aria-placeholder="search" placeholder="Search" />

            <div class="mt-2" v-show="objects.getFriendRequests.length > 0 && objects.showFriendsRequest">
                <h5>Friend requests</h5>
                <ul class="list-group">
                    <li class="list-group-item" v-for="item in objects.getFriendRequests" :key="item.users_id">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                {{ item.username }}
                            </div>

                            <div class="d-flex">
                                <button class="btn btn-success mx-1"
                                    @click="setFriendRequest(item, EFriendStatus.ACCEPT)">
                                    Accept
                                </button>

                                <button class="btn btn-danger mx-1"
                                    @click="setFriendRequest(item, EFriendStatus.REJECT)">
                                    Reject
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>


            <div class="mt-2" v-if="objects.searchedFriends.length > 0 && showResult">
                <h5 class="mt-2">Results</h5>
                <ul class="list-group">
                    <li class="list-group-item" v-for="item in objects.searchedFriends" :key="item.users_id">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                {{ item.username }}
                            </div>
                            <button class="btn btn-success d-inline-flex" @click="sendFriendRequest(item)"
                                :disabled="(item.friend_status === FriendStatus.waiting || item.friend_status === FriendStatus.friend)">
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
import { Form, Field, ErrorMessage } from "vee-validate"
import * as yup from "yup"
import IUser from '~/model/i_user';
import type IResponse from '~/model/response';
import toastStore from '~/store/toast-store';
import { EFriendStatus } from '~/model/enum/e_friend_status';

/* Interfaces  */
interface friend extends IUser {
    friend_status: string
}

enum FriendStatus {
    friend = "friend",
    waiting = "waiting",
    not_friends = "not_friends"
}

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
const objects = reactive<{
    searchedFriends: friend[],
    friends: friend[],
    getFriendRequests: IUser[],
    showFriendsRequest: boolean

}>({ searchedFriends: [], friends: [], getFriendRequests: [], showFriendsRequest: true })

const validator = yup.object({
    username: yup.string()
        .required("Username required")
})

/* Setup  */
onMounted(() => {
    $socket.emit("get_friends")
    $socket.emit("get_friend_requests")
})



watch(search, (newValue) => {
    showResult.value = newValue.length > 0
})

/* ACTIONS  */
const searchQuery = () => {
    $socket.emit("search_friend", { username: search.value.trim() })
}

const sendFriendRequest = (user: IUser) => {
    $socket.emit("friend_request", { receiver_id: user.users_id })
}

const setFriendRequest = (user: IUser, status_type: EFriendStatus) => {
    $socket.emit('update_friend_request', { sender_id: user.users_id, status: status_type })
}


/* SOCKET LISTENINGS */

$socket.on("search_friend_result", (response) => {
    try {
        const res = response as IResponse
        console.log(res)
        objects.searchedFriends = res.value as friend[]
    } catch (e) {
        console.error(e)
    }
})

$socket.on("get_friends_result", (response) => {
    console.log(response)
    console.log("get_friends_result tirggered")
    try {
        const res = response as IResponse
        objects.friends.push(...res.value)
    } catch (e) {
        console.error(e)
    }
})

$socket.on("friend_request_result", (response) => {
    try {
        const res = response as IResponse

        if (res.status == 200) {
            toast.success({ title: res.message, description: "" })
        } else {
            toast.error({ title: res.message, description: "" })
        }

    } catch (e) {
        console.error(e)
    }
})


$socket.on("update_friend_request_result", (response) => {
    try {
        const res = response as IResponse
        if (res.status == 200) {
            toast.success({ title: "Accepted", description: "" })
        } else {
            toast.error({ title: "Rejected", description: "" })
        }
    } catch (e) {

    }
})

$socket.on("get_friend_requests_result", (response) => {
    try {
        const res = response as IResponse

        objects.getFriendRequests = (res.value as IUser[])
    } catch (e) {
        console.error(e)
    }
})

$socket.on("friend_request_getted_result", (response) => {
    try{
        const res = response as IResponse

        if(res.status == 200){
            toast.success({ title: res.message, description: "" })
        }
    }catch(e){
        console.error(e)
    }
})
/* END */

</script>


<style scoped></style>