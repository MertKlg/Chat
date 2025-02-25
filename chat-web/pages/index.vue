<template>
  <div class="row m-0">
    <div class="col-3">
      <div class="col">
        <div class="row p-0 m-0 text-center my-2">
          <div class="col border rounded mx-2 d-flex align-items-center justify-content-center" style="cursor: pointer;">
            <span class="material-symbols-outlined py-2" >
              edit_square
            </span>
          </div>

          <div class="col border position-relative rounded mx-2" style="cursor: pointer;" @click="components = FriendComp">
            <span class="material-symbols-outlined py-2">
              person
            </span>
          </div>
        </div>
      </div>

      <div class="col">
        <ul class="list-group">
          <li class="list-unstyled list-group-item border-bottom border-top">
            <div class="row align-items-center">
              <div class="col">
                <span class="material-symbols-outlined fs-1">
                  account_circle
                </span>
              </div>
              <div class="col">
                <h6>John doe</h6>
                <p>Hello !</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="col">
      <component :is="components" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { StarterComp } from "#components";
import { ref} from "vue";
import FriendComp from "~/components/friend/friend-comp.vue";

const components = ref(StarterComp)

const {$socket} = useNuxtApp()

onMounted(() => {
    console.log("🔗 Connecting to socket...");
    
    if ($socket) {
        $socket.connect(); // Hata buradaysa, console.log($socket) ile içeriğini kontrol et
    } else {
        console.error("❌ Socket is undefined!");
    }
});

</script>
