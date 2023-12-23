<script setup lang="ts">
import type { OrderI } from '~/server/models/Order';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

const errorStore = useErrorStore();

const headers = [
  { title: 'Id', value: '_id' },
  { title: 'Name', value: 'name' },
  { title: 'Total', value: 'cart.total', align: 'end' },
];

const { data: orders } = await useFetch<OrderI[]>('/api/admin/orders');

function goToOrder(_:any, row:any) {
  console.log(row);
  navigateTo('/admin/orders/' + row.item._id);
}

function createNewOrder() {
  $fetch('/api/admin/orders', { method: 'post' })
    .then((res) => { navigateTo('/admin/orders/' + res._id); })
    .catch(() => { errorStore.error = 'There was an error creating the order.'; });
}

</script>

<template>
  <v-card
    title="Orders"
    class="mb-4 sans-serif"
  >
    <v-data-table
      :headers="headers as any"
      :items="orders || []"
      class="sans-serif"
      @click:row="goToOrder"
      hover
    ></v-data-table>
  </v-card>
  <v-btn
    icon="fas fa-plus"
    color="admin"
    position="absolute"
    style="right: 3vh; bottom: 3vh"
    @click="createNewOrder"
  ></v-btn>
</template>
