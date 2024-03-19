<script setup lang="ts">
import InventoryItemCard from '~/components/reusable/InventoryItemCard.vue';

import type { InventoryItemI } from '~/server/models/InventoryItem';
import type { NavigationCategoryI } from '~/server/models/ProductNavigation';

const router = useRoute();
const category = ref(router.query.initCat || '');
const { data: navCat } = await useFetch<NavigationCategoryI[]>('/api/navigation/products');
const { data: items } = await useFetch<InventoryItemI[]>('/api/inventory', { });

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
        All Products
      </v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col 
        cols="3"
        class="text-h5 weight-bold text-primary"
      >Select a Product Type</v-col>
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
          to="/"
        >
          BACK TO 
          HOME PAGE
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
            v-for="sub in navCat"
            class="mx-2"
          >
            <v-card
              class="pa-4"
              width="270"
              :to="'/products/' + sub._id"
              elevation="0"
            >
              <v-responsive
                :aspect-ratio="1/1"
              >
                <v-card
                  class="sans-serif ma-2 w-100 h-100"
                  flat
                  rounded="0"
                  color="primary"
                  :image="fromFullImagePath(sub.main.imageLocation || '')"
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
                :to="'/products/' + sub._id"
              >{{ sub.main.name }}</div>
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
      >Browse Products</v-col>
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
              :to="'/item/' + item._id"
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
