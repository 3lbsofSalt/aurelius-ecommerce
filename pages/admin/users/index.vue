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
  { title: 'Name', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Phone', value: 'phone' },
  { title: 'Permissions', value: 'permissionGroup' },
  { title: 'Actions', value: 'actions'}
]

const { data: users, error: usersError } = await useFetch<UserI[]>('/api/admin/users');
if(usersError) {
  errorStore.error = 'There was an error getting the users.';
}
</script>

<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="users || []"
      class="sans-serif"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn
          size="small"
          variant="text"
          icon="fas fa-pen"
          :href="'/admin/users/' + item._id"
        ></v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
