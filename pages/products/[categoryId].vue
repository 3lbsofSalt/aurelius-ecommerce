<script setup lang="ts">

import InventoryItemCard from '~/components/reusable/InventoryItemCard.vue';

import type { InventoryItemI } from '~/server/models/InventoryItem';
import type { NavigationCategoryI } from '~/server/models/ProductNavigation';

const route = useRoute();
const { data: navCat } = await useFetch<NavigationCategoryI>('/api/navigation/products/' + route.params.categoryId);
const { data: items } = await useFetch<InventoryItemI[]>('/api/inventory', {
  query: { categoryId: navCat.value?.main._id }
});

console.log(items.value);

</script>

<template>
  <v-container
    fluid
    style="width: 83%"
    class="mt-10"
  >
    <v-row>
      <v-divider
        class="border-opacity-100"
        length="20%"
      ></v-divider>
    </v-row>
    <v-row>
      <v-col
        class="text-h3 text-primary"
      >
        {{ navCat?.main.name }}
      </v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col 
        cols="3"
        class="text-h5 weight-bold text-primary"
      >{{(navCat?.subcategories?.length || 0) > 0 ? 'Select a Product Type' : ''}}</v-col>
      <v-col cols="3"></v-col>
      <v-col 
        cols="3"
        class="d-flex justify-end"
      >
        <v-btn
          variant="outlined"
          rounded="0"
          class="sans-serif"
          style="text-wrap: wrap;"
          append-icon="fas fa-arrow-right"
          to="/products"
        >
          BACK TO 
          ALL PRODUCTS
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col
        cols="9"
      >
        <v-slide-group>
          <v-slide-group-item
            v-for="sub in navCat?.subcategories"
            class="mx-2"
          >
            <v-card
              class="pa-4"
              width="230"
              :to="'/products/' + sub._id"
            >
              <v-responsive
                :aspect-ratio="1/1"
              >
                <v-card
                  class="sans-serif ma-2 w-100 h-100"
                  flat
                  rounded="0"
                  color="primary"
                  :image="fromFullImagePath(sub.imageLocation || '')"
                >
                  <v-btn
                    style="position: absolute; bottom: 6%; right: 6%;"
                    rounded="0"
                    class="font-weight-bold text-white bg-primary"
                  >EXPLORE</v-btn>
                </v-card>
              </v-responsive>
              <div
                class="text-h6 sans-serif mt-5 font-weight-bold text-primary"
              >{{ sub.name }}</div>
              <v-divider 
                color="primary"
                class="mt-4 border-opacity-100"
              ></v-divider>
            </v-card>
          </v-slide-group-item>                
        </v-slide-group>
      </v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col 
        cols="3"
        class="text-h5 weight-bold text-primary"
      >{{(items?.length || 0) > 0 ? 'Browse Products' : 'No Products in this category'}}</v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3"></v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col
        cols="9"
      >
        <v-container
          fluid
        >
          <v-row>
            <v-col
              v-for="item in items"
              cols="4"
            >
              <InventoryItemCard 
                :item="item"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>
