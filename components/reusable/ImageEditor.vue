<script setup lang="ts">
const emit = defineEmits<{
  (e: 'addImages',  files: File[] ): void,
  (e: 'changeImageName', name: string, index: number): void,
  (e: 'changeImageAlt', alt: string, index: number): void,
  (e: 'moveImage', originalIndex: number, newIndex: number): void,
  (e: 'removeImage', index: number): void
}>();

defineProps([ 'editing', 'images' ]);
</script>

<template>
  <div>
    <v-carousel
      v-if="images.length"
    >
      <v-carousel-item
        v-for="(image, i) in images"
        :key="i"
        eager
      >
        <v-img
          eager
          :src="image.location"
        />
      </v-carousel-item>
    </v-carousel>
    <p v-else>No Images To Display</p>

    <v-list>
      <v-list-item
        v-for="(image, i) in images"
        :key="i"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <v-img
              cover
              :src="image.location"
            />
          </v-avatar>
        </template>
        <v-list-item-title
          class="d-flex pt-4"
        >
          <v-text-field
            :model-value="images[i].name"
            @update:model-value="(val) => { $emit('changeImageName', val, i); }"
            label="File Name"
            class="px-2"
            :readonly="!editing"
            variant="outlined"
            :active="images[i].name !== ''"
          />
          <v-text-field
            :model-value="images[i].altText"
            @update:model-value="(val) => { $emit('changeImageAlt', val, i); }"
            label="Alt Text"
            class="px-2"
            :readonly="!editing"
            variant="outlined"
            :active="images[i].name !== ''"
          />
        </v-list-item-title>
        <template v-slot:append>
          <div class="d-flex flex-column pa-2">
            <v-icon
              v-if="i !== 0"
              @click="$emit('moveImage', i, i - 1)"
              :disabled="!editing"
              icon="fas fa-caret-up"
            />
            <v-icon
              v-if="i < images.length - 1"
              @click="$emit('moveImage', i, i + 1)"
              :disabled="!editing"
              icon="fas fa-caret-down"
            />
          </div>
          <v-icon
            color="error"
            @click="$emit('removeImage', i)"
            :disabled="!editing"
            icon="fas fa-trash-alt"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-file-input
      @update:model-value="(files: File[]) => $emit('addImages', files)"
      :value="[]"
      label="Add Images"
      multiple
      v-if="editing"
    />
  </div>
</template>

