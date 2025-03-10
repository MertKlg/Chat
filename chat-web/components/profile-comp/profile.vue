<template>
    <div class="container h-100">
        <div class="row justify-content-center h-100">
            <div class="col h-100">
                <div class="card h-100 border-0">
                    <div class="card-header">
                        <h4 class="mb-0">{{ profile.userProfile?.username }}'s profile</h4>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-4">
                            <img :src="'https://placehold.co/150x150'" alt="Profile Image" class="rounded-circle"
                                style="width: 150px; height: 150px; object-fit: cover;" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" v-model="profileInformation.username"
                                placeholder="Username" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="profileInformation.email"
                                placeholder="Email address" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Phone</label>
                            <input type="text" class="form-control" :value="profileInformation.phone"
                                placeholder="Phone number" />
                        </div>

                        <div class="col">
                            <button class="btn btn-success mx-1" @click="updateProfile">Update profile</button>
                            <button class="btn btn-danger mx-1" disabled>Delete profile</button>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import profileStore from '~/store/profile-store';
import UpdateProfile from './update-profile.vue';
import { reactive, watch } from 'vue';
import { clientSideFetch } from '~/common/genericFetch';
import { API_URL } from '~/common/API';
import type IResponse from '~/model/interfaces/iresponse';
import ResponseModel from '~/model/response-model';
import toastStore from '~/store/toast-store';

const toast = toastStore()
const profile = profileStore()

const profileInformation = reactive<{
    username : string,
    email : string,
    phone : string
}>({
    username : '',
    email : '',
    phone : ''
})

watch(() => profile.userProfile, (newValue) => {
    if (newValue) {
        profileInformation.username = newValue.username;
        profileInformation.email = newValue.email;
        profileInformation.phone = newValue.phone;
    }
},{immediate : true});

const updateProfile = async() => {
    
    console.log(profileInformation)
    try{
        const res = await clientSideFetch({
            url : `${API_URL}/profile/update`,
            body : profileInformation,
            credentials : 'include',
            immediate : false,
            method : 'PUT'
        }) as IResponse

        
        toast.success({title : res.message, description : ''})  
    }catch(e){
        if(e instanceof ResponseModel){
            toast.error({title : e.message, description : ''})  
            return 
        }
        toast.error({title :'Something went wrong', description : ''}) 

        console.log(e)
    }
}


</script>
