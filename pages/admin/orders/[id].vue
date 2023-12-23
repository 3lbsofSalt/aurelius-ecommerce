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

const route = useRoute();
const { data: order, error: orderError } = await useFetch<OrderI>('/api/admin/orders/' + route.params.id);

console.log(order.value);
if(orderError || !order.value) {
  errorStore.error = 'There was an error getting this Order';
}
</script>

<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col class="pa-1">
        <v-card
          class="sans-serif w-100"
        >
          <template v-slot:title>
            <div
              class="text-h4 font-weight-bold"
            >
              {{'#' + order?._id + ' - ' + order?.name}}
            </div>
          </template>
          <template v-slot:append></template>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col 
        cols="8"
        class="pa-1"
      >
        <v-card
          title="Order Cart"
          class="sans-serif w-100"
        >
          <v-expansion-panels
          >
          </v-expansion-panels>
        </v-card>
      </v-col>
      <v-col class="pa-1">
        <v-card
          cols="4"
          title="Customer"
          class="sans-serif w-100"
        >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
