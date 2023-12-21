<script setup lang="ts">
import type { NavigationCategoryI } from '~/server/models/ProductNavigation';
import type { SettingI } from '~/server/models/Setting';
import type { TagI } from '~/server/models/Tag';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Navigation')) {
  navigateTo('/');
}

const errorStore = useErrorStore();

const selectedMainCategory = ref<{title: string, value: TagI} | undefined>(undefined);

const { data: tags, error: tagError } = await useFetch<TagI[]>('/api/tags');
if(tagError) {
  errorStore.error = 'There was an error getting the tags';
}

const { data: productNavigationCategories, error: productNavigationError, refresh: refreshProductNavigationCategories } = await useFetch<NavigationCategoryI[]>('/api/navigation/products');
if(productNavigationError) {
  errorStore.error = 'There was an error getting the current navigation categories';
}

const selectableMainCategories = computed(() : { title: string, value: TagI }[] => {
  console.log(tags.value)
  return tags.value
    ?.filter(tag => !productNavigationCategories.value?.find(cat => tag.name === cat.main.name))
    .map((tag) => ({ title: tag.name, value: tag})) || [];
});

function addMainProductCategory() {
  console.log(selectedMainCategory.value);
  $fetch('/api/admin/navigation/products', {
    method: 'post',
    body: {
      tag: selectedMainCategory.value?.value
    }
  })
    .then(() => { refreshProductNavigationCategories(); })
    .catch(() => { errorStore.error = 'There was an error adding the product categories.'; });
}

function deleteProductMainCategory(id : string) {
  $fetch('/api/admin/navigation/products/' + id, {
    method:'delete'
  })
    .then(() => { refreshProductNavigationCategories(); })
    .catch(() => { errorStore.error = 'There was an error deleting the product category.'; });
}

</script>

<template>
  <v-card
    class="sans-serif font-weight-light"
    rounded="0"
    title="Product Main Categories"
  >
    <v-list
      density="compact"
    >
      <v-list-item>
        <v-combobox
          v-model="selectedMainCategory"
          variant="outlined"
          label="New Category"
          append-icon="fas fa-plus"
          class="mx-3"
          :items="selectableMainCategories"
          @click:append="addMainProductCategory"
        ></v-combobox>
      </v-list-item>
      <v-list-item
        v-for="cat in productNavigationCategories"
        :key="cat._id"
        :title="cat.main.name"
      >
        <template v-slot:append>
          <v-btn 
            class="text-error" 
            icon="fas fa-trash"
            @click="deleteProductMainCategory(cat._id)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
