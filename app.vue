<script setup lang="ts">
const authStore = useAuthStore();
authStore.checkForSession();
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

