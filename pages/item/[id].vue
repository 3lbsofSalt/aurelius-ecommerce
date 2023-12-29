<script setup lang="ts">
import type { InventoryItemI } from '~/server/models/InventoryItem';

const errorStore = useErrorStore();
const cartStore = useCartStore();
console.log(cartStore.cart);

const route = useRoute();
const { data: item, error: inventoryItemError } = await useFetch<InventoryItemI>('/api/inventory/' + route.params.id);
if(inventoryItemError.value) { errorStore.error = 'There was a problem getting the inventory item.'; }

const quantity = ref('1');
const emptyFile = [new File([new Blob()], 'empty')];
const inputFields = ref<(string | File[])[]>(item.value?.customerInputFields?.map((input) => {
  if(input.type === 'download') return emptyFile;
  return '';
}) || []);
</script>

<template>
  <v-container
    fluid
    class="mt-6 sans-serif"
  >
    <v-row>
      <v-col>
        <v-carousel
          hide-delimiters
          :show-arrows="(item?.images?.length || 0) > 1"
        >
          <v-carousel-item
            v-for="image in item?.images || []"
          >
            <v-img 
              :src="baseImageUrl(item?.baseImagePath || '', image)"
            />
          </v-carousel-item>
        </v-carousel>
      </v-col>
      <v-col
        class="text-primary pa-12"
      >
        <v-row>
          <v-col>
            <div
              class="text-h2 text-primary"
            >{{item?.name}}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div
              class="sans-serif"
            >{{ item?.description }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="text-h4 sans-serif">{{ '$' + item?.price.toFixed(2) }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field 
              v-model="quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              required
              :rules="requiredPositiveIntegerRules"
            />
          </v-col>
        </v-row>
        <v-row
          v-for="input, i in item?.customerInputFields"
          no-gutters
        >
          <v-col>
            <div class="text-h6 font-weight-bold sans-serif">{{ input.name + (input.required ? '*' : '') }}</div>
            <div class="text-subtitle-1 sans-serif">{{ input.description }}</div>
            <v-text-field
              v-model="inputFields[i]"
              v-if="input.type === 'text'"
              variant="outlined"
              :required="input.required"
              :rules="wideRangeAlphaNumericRules"
            ></v-text-field>
            <v-file-input
              v-model="inputFields[i] as any"
              v-else-if="input.type === 'download'"
              variant="outlined"
              :required="input.required"
            ></v-file-input>
          </v-col>
        </v-row>
        <v-row>
          <v-btn
            block
            color="primary sans-serif"
            @click="cartStore.addToCart(item as InventoryItemI, Number.parseInt(quantity.toString()), inputFields)"
          >Add to Cart</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
