<script setup lang="ts">
import type { NavigationCategoryI } from '~/server/models/ProductNavigation';
import type { TagI } from '~/server/models/Tag';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Navigation')) {
  navigateTo('/');
}

const errorStore = useErrorStore();

// Adding a new main category
const selectedMainCategory = ref<{title: string, value: TagI} | undefined>(undefined);

// Tags
const { data: tags, error: tagError } = await useFetch<TagI[]>('/api/tags');
if(tagError) {
  errorStore.error = 'There was an error getting the tags';
}

// Getting the navigation categories
const { data: productNavigationCategories, error: productNavigationError, refresh: refreshProductNavigationCategories } = await useFetch<NavigationCategoryI[]>('/api/navigation/products');
if(productNavigationError.value) { errorStore.error = 'There was an error getting the current navigation categories'; }


// Getting the main categories that are left over
const selectableMainCategories = computed(() : { title: string, value: TagI }[] => {
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

// Setting up the editable data for subcategories
/*
[
  [id, id, id], [id, id], ...
]
*/
const editableProdNavSubCats = ref(productNavigationCategories.value?.map(cat => {
  return cat.subcategories?.map((subcat) => subcat._id);
}) || []);

console.log(editableProdNavSubCats);

// All tags except the one provided
function allTagsExceptYours(currentTag: string) { return tags.value?.filter((tag) => tag.name !== currentTag) || []; }
// Update the tags
function updateTags(index : number) { 
  const cat = editableProdNavSubCats.value[index];
  $fetch('/api/admin/navigation/products/' + productNavigationCategories.value?.[index]._id, {
    method: 'put',
    body: {
      subcategories: cat
    }
  });
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
        v-for="(cat, i) in productNavigationCategories"
        :key="cat._id"
        :title="cat.main.name"
      >
        <v-combobox 
          v-model="editableProdNavSubCats[i]"
          label="Subcategories"
          variant="outlined" 
          class="ma-2"
          :items="allTagsExceptYours(cat.main.name).map(tag => ({
            title: tag.name, value: tag._id
          }))"
          @blur="updateTags(i)"
          chips
          multiple
          :return-object="false"
        ></v-combobox>
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
