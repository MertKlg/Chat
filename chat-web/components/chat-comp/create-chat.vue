<template>
    <div class="container">
        <h5>Let's create a chat !</h5>

        <button class="btn btn-primary w-100 disabled" disabled>Create Group</button>

        <div class="col mt-3">
            <ul class="list-group w-100" >
                    <li class="list-group-item" v-for="item in objects.friends" :key="item.user_id">
                        <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;">
                            <div>
                                {{ item.username }}
                            </div>
                            <button class="btn btn-primary" @click="createChat(item)">
                                Create Chat
                            </button>
                        </div>
                    </li>
                </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import type IUser from '~/model/interfaces/iuser';
import type IResponse from '~/model/interfaces/iresponse';

const { $socket } = useNuxtApp();

const objects = ref<{ friends: IUser[] }>({ friends: [] });

$socket.emit("get_friends")

$socket.on("get_friends_result", (response) => {
    try {
        const res = response as IResponse
        if(res.status == 200){
            console.log(res.value)
            objects.value.friends = res.value as IUser[]
        }

    } catch (e) {
        console.error(e)
    }
})


const createChat = (user : IUser) => {
    console.log("create chat with that user : " + user.user_id)
    $socket.emit("create_chat", {"to_user_id" : user.user_id});
}


</script>

<style></style>