<template>
    <div class="container h-100">
        <div class="row justify-content-center h-100">
            <div class="col h-100">
                <div class="card h-100 border-0">
                    <div class="card-header">
                        <h4 class="mb-0">Update Profile</h4>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-4">
                            <img :src="updatedProfile.photo" alt="Profile Image" class="rounded-circle"
                                style="width: 150px; height: 150px; object-fit: cover;" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" v-model="updatedProfile.username" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="updatedProfile.email" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Phone</label>
                            <input type="text" class="form-control" v-model="updatedProfile.phone" />
                        </div>

                        <div class="col">
                            <button class="btn btn-success mx-1" >Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import profileStore from '~/store/profile-store';
import { reactive } from 'vue';

const profile = profileStore();

const updatedProfile = reactive({
    username: profile.userProfile?.username || '',
    email: profile.userProfile?.email || '',
    phone: profile.userProfile?.phone || '',
    photo : profile.userProfile?.phone || 'http://localhost:8080/storage/defaults/default_profile_photo.png',
});




</script>
