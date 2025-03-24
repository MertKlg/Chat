<template>
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">

        <div 
        class="toast show align-items-center  border-0 mb-2" role="warning" aria-live="assertive"
        v-for="item in store.toasts"
        :key="item.id"
        :class="{
            'text-bg-warning' : item.status == 'warning',
            'text-bg-success' : item.status == 'success',
            'text-bg-danger' : item.status == 'error',
            'text-bg-info' : item.status == '',
        }"
            aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong class="me-2">{{ item.status == 'error' ? "Error" : item.status == 'success' ? 'Success' : item.status == 'warning' ? 'Warning' : 'Info' }}</strong>
                    <small>{{ item.title }}</small>
                    <br>
                    <small>{{ item.description }}</small>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                    aria-label="Close" @click="store.remove(item.id)"></button>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import toastStore from "~/store/toast-store";

const store = toastStore()

</script>
