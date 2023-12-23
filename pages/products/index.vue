<script setup lang="ts">
import type { NavigationCategoryI } from '~/server/models/ProductNavigation';

const router = useRoute();
const category = ref(router.query.initCat || '');
const { data: productNavigationCategories } = await useFetch<NavigationCategoryI[]>('/api/navigation/products', {
  query: { }
});

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
        {{category === '' ? 'All Products' : category}}
      </v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col cols="3">Select a Product Type</v-col>
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
        >
          BACK TO 
          ALL PRODUCTS
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
