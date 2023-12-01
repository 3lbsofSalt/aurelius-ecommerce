<script setup lang="ts">
import type { UserI } from '~/server/models/User';
definePageMeta({
  layout: 'admin'
})

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Phone', value: 'phone' },
  { title: 'Permissions', value: 'permissionGroup' },
  { title: 'Actions', value: 'actions'}
]

const { data: users } = await useFetch<UserI[]>('/api/admin/users');
</script>

<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="users"
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
