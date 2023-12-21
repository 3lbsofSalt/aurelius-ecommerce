<script setup lang="ts">
import type { SettingI } from '~/server/models/Setting';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Settings')) {
  navigateTo('/');
}

</script>

<template>

  <v-card
    class="sans-serif font-weight-light"
    rounded="0"
    title="Location Permissions"
  >
    <v-list
      density="compact"
    ></v-list>
  </v-card>

</template>
