<script setup lang="ts">
import type { InventoryItemI } from '~/server/models/InventoryItem'
defineProps<{
  item: InventoryItemI
}>();
</script>
<template>
  <v-card
    :to="'/item/' + item._id"
    class="pa-4"
    elevation="0"
  >
    <v-responsive
      :aspect-ratio="1/1"
    >
      <v-card
        class="sans-serif w-100 h-100"
        flat
        rounded="0"
        color="primary"
        :image="baseImageUrl(item.baseImagePath || '', item?.images[0] || '')"
      >
        <v-btn
          style="position: absolute; bottom: 6%; right: 6%;"
          rounded="0"
          class="font-weight-bold text-white bg-primary"
        >ORDER</v-btn>
      </v-card>
    </v-responsive>
    <div
      class="text-h6 sans-serif mt-5 font-weight-bold text-primary"
    >{{ item.name }}</div>
    <div
      class="text-h6 sans-serif font-weight-light text-primary"
    >{{ '$' + item.price.toFixed(2) }}</div>
    <v-divider 
      color="primary"
      class="mt-4 border-opacity-100"
    ></v-divider>
  </v-card>
</template>
