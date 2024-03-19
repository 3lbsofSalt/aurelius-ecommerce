<script setup lang="ts">
const errorStore = useErrorStore();
import type { UserI } from '~/server/models/User';
definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Users')) {
  navigateTo('/');
}

const headers = [
  { title: 'Id', value:'_id', align: 'start' },
  { title: 'Name', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Phone', value: 'phone' },
  { title: 'Permissions', value: 'permissionGroup' },
]

const { data: users, error: usersError } = await useFetch<UserI[]>('/api/admin/users');
if(usersError.value) {
  errorStore.error = 'There was an error getting the users.';
}

function goToUser(_: any, row: any) { navigateTo('/admin/users/' + row.item._id); }
</script>

<template>
  <v-card>
    <v-data-table
      :headers="headers as any"
      :items="users || []"
      class="sans-serif"
      @click:row="goToUser"
      hover
    > </v-data-table>
  </v-card>
</template>
