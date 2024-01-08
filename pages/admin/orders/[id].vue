<script setup lang="ts">
import type { OrderI } from '~/server/models/Order';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

const cartHeaders = [
  { title: 'Image', value: 'image' }, 
  { title: 'Name', value: 'name' },
  { title: 'Qty', value: 'quantity' },
  { title: 'Price', value: 'price' },
  { title: 'Total', value: 'total' }
];

const errorStore = useErrorStore();

const route = useRoute();
const { data: order, error: orderError } = await useFetch<OrderI>('/api/admin/orders/' + route.params.id);

if(orderError.value || !order.value) {
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
          <v-data-table
            show-expand
            :headers="cartHeaders"
          >
          </v-data-table>
          <v-container>

            <v-row
              v-for="item in order?.cart.items"
            >
              <v-col>
              <v-img
                width="80"
                cover
                aspect-ratio="1/1"
                :src="baseImageUrl(item.item.baseImagePath || '', item.item.images[0])"
              ></v-img>
              </v-col>
              <v-col>{{item.item.name}}</v-col>
              <v-col>Qty: {{item.quantity}} @ {{item.item.price.toFixed(2)}} = {{(item.quantity * item.item.price)}}</v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col class="pa-1">
        <v-card
          cols="4"
          title="Customer"
          class="sans-serif w-100"
        >
          <v-container>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
