<script setup lang="ts">
// Next, get total, tax. Then validate billing info
import type { OrderI } from '~/server/models/Order';
import { orderStatuses, paymentTypes, paymentStatuses } from '~/server/models/Order';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

const cartHeaders = [
  { title: 'Image', value: 'image' }, 
  { title: 'Name', value: 'item.name' },
  { title: 'Qty', value: 'quantity' },
  { title: 'Price', value: 'item.price' },
  { title: 'Total', value: 'total' }
];

const errorStore = useErrorStore();

const route = useRoute();
const { data: order, error: orderError } = await useFetch<OrderI>('/api/admin/orders/' + route.params.id);

if(orderError.value || !order.value) {
  errorStore.error = 'There was an error getting this Order';
}

const paymentType = ref(order.value?.paymentType);
const paymentStatus = ref(order.value?.paymentStatus);
const orderStatus = ref(order.value?.orderStatus);

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
      <v-col class="pa-1">
        <v-card
          class="sans-serif w-100"
        >
          <v-container>
            <v-row>
            </v-row>
            <v-row>
              <v-col>
                <v-select 
                  label="Payment Type"
                  variant="outlined"
                  v-model="paymentType"
                  :items="paymentTypes"
                />
              </v-col>
              <v-col>
                <v-select 
                  label="Payment Status"
                  variant="outlined"
                  v-model="paymentStatus"
                  :items="paymentStatuses"
                />
              </v-col>
              <v-col>
                <v-select 
                  label="Order Status"
                  variant="outlined"
                  v-model="orderStatus"
                  :items="orderStatuses"
                />
              </v-col>
            </v-row>
          </v-container>
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
            :headers="cartHeaders"
            :items="order?.cart.items"
          >
            <template v-slot:item.image="{ item }">
              <v-avatar
                rounded="0"
              >
                <v-img 
                  cover
                  :src="baseImageUrl(item.item.baseImagePath, item.item.images[0])"
                />
              </v-avatar>
            </template>
            <template v-slot:item.total="{ item }">
              {{(item.quantity * item.item.price).toFixed(2)}}
            </template>
          </v-data-table>
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
