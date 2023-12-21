<script setup lang="ts">
import type { InventoryItemI } from '~/server/models/InventoryItem';
import type { TagI } from '~/server/models/Tag';
import { baseImageUrl } from '~/utils/imageRetrieval';

const errorStore = useErrorStore();
definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

const headers = [
  { title: 'Image', value: 'image' },
  { title: 'Id', value: '_id' },
  { title: 'Name', value: 'name' },
  { title: 'Price', value: 'price' },
];

const { data: inventoryItems, error: inventoryError, refresh: inventoryRefresh } = await useFetch<InventoryItemI[]>('/api/inventory');
if(inventoryError) {
  errorStore.error = 'There was an error getting the inventory items.';
}

const creatingItem = ref(false);
function stopCreatingItem() { 
  creatingItem.value = false; 
  inventoryRefresh();
}
function startCreatingItem() { creatingItem.value = true; }

const { data: tags, error: tagError, refresh: refreshTags } = await useFetch<TagI[]>('/api/tags');
if(tagError) {
  errorStore.error = 'There was an error getting the tags';
}

const creatingTag = ref(false);
const newTag = ref('');
function openTagCreate() {
  newTag.value = '';
  creatingTag.value = true;
}

function createTag() {
  $fetch('/api/admin/tags', {
    method: 'post',
    body: {
      name: newTag.value
    }
  })
    .then(() => { refreshTags(); })
    .catch(() => { errorStore.error = 'There was an error creating the tag.'; })
    .finally(() => { creatingTag.value = false; });
}

function deleteTag(id: string) {
  $fetch('/api/admin/tags/' + id, {
    method: 'delete'
  })
    .then(() => { refreshTags(); })
    .catch(() => { errorStore.error = 'There was an error deleting the tag.'; })
    .finally(() => { creatingTag.value = false; });
}

function goToItem(_:any, row : any) {
  navigateTo('/admin/inventory/' + row.item._id);
}
</script>

<template>
  <v-card
    title="Tags"
    class="mb-4 sans-serif"
  >
    <template v-slot:append>
      <v-btn @click="openTagCreate">
        Add Tag
        <v-dialog 
          v-model="creatingTag"
          width="500"
          class="sans-serif"
        >
          <template v-slot:default>
            <v-card 
              title="Create a Tag"
            >
              <v-form @submit.prevent="createTag">
              <v-card-text>
                <v-text-field
                  label="Tag Name"
                  v-model="newTag"
                  variant="outlined"
                  required
                  :rules="alphaNumericRules"
                ></v-text-field>
              </v-card-text>
                <v-card-actions>
                  <v-btn
                    type="submit"
                  >Create Tag</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </template>
        </v-dialog>
      </v-btn>
    </template>
    <v-list
      density="compact"
    >
      <v-list-item 
        v-for="tag in tags"
        :title="tag.name"
      >
        <template v-slot:append>
          <v-btn 
            class="text-error" 
            icon="fas fa-trash"
            @click="deleteTag(tag._id)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>

  <v-card>
    <v-data-table
      :headers="headers"
      :items="inventoryItems || []"
      class="sans-serif"
      @click:row="goToItem"
      hover
    >
      <template v-slot:item.image="{ item }">
        <v-avatar
          rounded="0"
        >
          <v-img 
            cover
            :src="baseImageUrl(item.baseImagePath, item.images[0])"
          />
        </v-avatar>
      </template>
    </v-data-table>
  </v-card>


  <ContainersAdminCreateInventoryItem 
    :open="creatingItem"
    @close="stopCreatingItem"
  />
  <v-btn
    icon="fas fa-plus"
    position="absolute"
    style="right: 3vh; bottom: 3vh"
    @click="startCreatingItem"
  ></v-btn>

</template>
