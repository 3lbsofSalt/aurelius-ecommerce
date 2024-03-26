<script setup lang="ts">
import InventoryItemCard from '~/components/reusable/InventoryItemCard.vue';

import type { InventoryItemI } from '~/server/models/InventoryItem';
import type { NavigationCategoryI } from '~/server/models/ProductNavigation';

const { data: items } = await useFetch<InventoryItemI[]>('/api/inventory');
const { data: productNavigationCategories } = await useFetch<NavigationCategoryI[]>('/api/navigation/products');
</script>

<template>
  <div>
    <v-container
      fluid
      class="pa-0"
    >
      <v-row no-gutters>
        <v-col
          xs="12"
          md="6"
        >
          <v-img src="/woman-looking-picture-albums.jpg" />
        </v-col>
        <v-col
          xs="12"
          md="6"
          class="d-flex justify-center align-center"
        >
          <v-container
            style="padding-left: 12%;"
          >
            <v-row
              class="mb-10"
            >
              <v-col>
                <v-divider
                  class="border-opacity-100"
                  color="bg-primary primary"
                ></v-divider>
              </v-col>
              <v-col></v-col>
              <v-col></v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <div class="text-h2 font-weight-light text-primary">Mountain Valley Printing</div>
                <div class="text-h2 font-weight-light text-primary">OOF</div>
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="my-2"
            >
              <v-col>
                <div class="text-h5 font-weight-light text-primary">Whatever you need printed, we've got you covered.</div>
              </v-col>
            </v-row>
            <v-row
              class="mt-16"
            >
              <v-col>
                <div
                  class="text-body-1 pr-10 text-primary"
                  style="width: 32vh;"
                >Shop for prints, enlargements, gifts, photo books, wall decor & more!</div>
              </v-col>
              <v-col>
                <v-btn
                  class="text-none text-primary sans-serif font-weight-bold"
                  color="primary"
                  variant="outlined"
                  rounded="0"
                  size="x-large"
                  to="/products"
                >Shop Now</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
      <v-row
        class="mt-12"
      >
        <v-col
          class="d-flex justify-center align-center"
        >
          <v-divider
            color="primary"
            class="border-opacity-100"
            length="85%"
          ></v-divider>
        </v-col>
      </v-row>
      <v-row
          class="my-15 d-flex justify-center align-center"
      >
        <v-col></v-col>
        <v-col
          class="d-flex justify-center align-center"
        >
          <div
            class="text-body-1 text-primary"
            style="width: 30vh;"
          >Create an account to save photos so you can go back to projects and finish them on your own time</div>
        </v-col>
        <v-col
          class="d-flex justify-start align-center ga-10 ml-10"
        >
          <v-btn
            class="text-primary sans-serif font-weight-bold"
            color="primary"
            variant="outlined"
            rounded="0"
            size="x-large"
            to="/signup"
          >Sign In</v-btn>
          <v-btn
            class="text-primary sans-serif font-weight-bold"
            color="primary"
            variant="outlined"
            rounded="0"
            size="x-large"
            to="/login"
          >Join</v-btn>
        </v-col>
        <v-col></v-col>
      </v-row>
      <v-row>
        <v-col
          class="d-flex justify-center align-center"
        >
          <v-divider
            color="primary"
            class="border-opacity-100"
            length="85%"
          ></v-divider>
        </v-col>
      </v-row>
      <v-row
        class="mt-8"
      >
        <v-col
          class="d-flex justify-center"
        >
          <div class="text-primary text-h4">
            BROWSE ALL PRODUCTS
          </div>
        </v-col>
      </v-row>
      <v-row
        class="mb-16"
      >
        <v-col
          class="d-flex justify-center"
        >
          <v-icon 
            color="primary"
            icon="fas fa-down-long"
          ></v-icon>
        </v-col>
      </v-row>
      <v-container
        fluid
        style="width: 83%"
      >
        <v-row>
          <v-col>
            <div
              class="text-h4 text-primary"
            >
              Products & Services
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider
              class="border-opacity-100"
              style="width: 48%;"
            ></v-divider>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="3"
          >
            <v-list
              class="text-primary sans-serif mt-2"
            >
              <v-list-item
                to="/products"
              >ALL</v-list-item>
              <v-list-item
                v-for="cat in productNavigationCategories"
                :to="'/products/' + cat._id"
              >{{ cat.main.name.toUpperCase() }}</v-list-item>
            </v-list>
          </v-col>
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
    </v-container>
  </div>
</template>

<style lang="css" scoped>
h1 {
  font-size: 80px;
}
</style>

