<template>
    <div>
        <h3>Welcome {{ profile.userProfile?.username }}</h3>
        <p>Let's chat people !</p>
    </div>
</template>

<script setup lang="ts">
import profileStore from '~/store/profile-store';
const profile = profileStore()


</script>

<style>

</style>