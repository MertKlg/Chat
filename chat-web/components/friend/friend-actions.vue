<template>
  <div
    class="position-absolute z-3 mt-1 start-0 dropdown-menu d-block position-static border-0 p-0 m-0 rounded-3 shadow overflow-hidden"
    data-bs-theme="white"
  >
  <ul class="list-unstyled mb-0">
    <li>
      <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#">
        <span class="d-inline-block bg-success rounded-circle p-1"></span>
        Add friend
      </a>
    </li>
    <li>
      <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#">
        <span class="d-inline-block bg-primary rounded-circle p-1"></span>
        Friend requests
      </a>
    </li>
    <li>
      <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#">
        <span class="d-inline-block bg-danger rounded-circle p-1"></span>
        FriendList
      </a>
    </li>
  </ul>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import FriendActions from "./friend-actions.vue";
import AddFriend from "./add-friend.vue";

</script>

<style>
</style>