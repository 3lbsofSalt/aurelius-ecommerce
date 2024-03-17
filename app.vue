<script setup lang="ts">
console.log('I at least know that it started')
const authStore = useAuthStore();
await authStore.checkForSession();

const cartStore = useCartStore();
await cartStore.initializeCart();
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<style>
.sans-serif {
  font-family: 'Montserrat', Arial !important;
}
</style>

