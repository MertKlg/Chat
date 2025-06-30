<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h3 class="text-center">Create Group</h3>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-12">
                <form @submit.prevent="createGroup">
                    <div class="mb-3">
                        <label for="groupName" class="form-label">Group Name</label>
                        <input type="text" class="form-control" id="groupName" v-model="groupName" required>
                    </div>

                    <div class="mb-0" v-if="members.length > 0">
                        <span>Added</span>
                        <ul class="list-unstyled d-flex">
                            <li v-for="item in members" :key="item.user_id">
                                <div>
                                    <img :src="config.public.BASE_URL + item.photo" class="rounded-circle me-2"
                                        style="width: 20px; height: 20px; object-fit: cover;" />
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="mb-3">
                        <label for="groupMembers" class="form-label">Add Members</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="groupMembers" v-model="search"
                                @input="searchQuery" placeholder="Search members">
                        </div>
                    </div>
                    <div class="mb-3" v-if="objects.searchedFriends.length > 0">
                        <ul class="list-group">
                            <li class="list-group-item" v-for="item in objects.searchedFriends" :key="item.user_id">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <img :src="config.public.BASE_URL + item.photo" class="rounded-circle me-2"
                                            style="width: 40px; height: 40px; object-fit: cover;" />
                                        {{ item.username }}
                                    </div>
                                    <button class="btn btn-success d-inline-flex" @click="addMember(item)"
                                        :disabled="members.some(member => member.user_id === item.user_id)">
                                        <span class="material-symbols-outlined pe-2">
                                            person_add
                                        </span>
                                        Add
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <button type="submit" class="btn btn-success w-100"
                        :disabled="groupName.length < 1 || members.length < 1">Create group</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { IFriend } from '~/model/friend-model'
import type IResponse from '~/model/interfaces/iresponse'
import type IUser from '~/model/interfaces/iuser'
import toastStore from '~/store/toast-store'

const groupName = ref<string>("")
const search = ref<string>("")
const config = useRuntimeConfig()
const toast = toastStore()
const { $socket } = useNuxtApp()
const objects = reactive<{
    searchedFriends: IFriend[]
}>({ searchedFriends: [] })

const members = ref<IFriend[]>([])

const listeners = () => {
    $socket.on("search_user_result", search_user_result)
    $socket.on("create_group_chat_result", create_group_chat_result)
}

onMounted(() => {
    listeners()
})

const searchQuery = () => {
    $socket.emit("search_user", { username: search.value.trim() })
}

const addMember = (user: IFriend) => {
    members.value.push(user)
}

const createGroup = () => {
    $socket.emit("create_group_chat", { group_name: groupName.value, members: members.value })
}


const search_user_result = (response: any) => {
    try {
        const res = response as IResponse
        console.log(res.value)
        const toUser = res.value as IFriend[]
        objects.searchedFriends = toUser.filter(user => !members.value.some(member => member.user_id === user.user_id))
    } catch (e) {
        console.error(e)
    }
}

const create_group_chat_result = (response: any) => {
    try {
        const res = response as IResponse

        toast.sendToastWithResponse(res)
    } catch (e) {
        console.error(e)
    }
}


</script>