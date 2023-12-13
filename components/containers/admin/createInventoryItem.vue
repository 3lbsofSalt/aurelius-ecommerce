<script setup lang="ts">

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

import type { TagI } from '~/server/models/Tag';
import type { WeightI, CustomInputFieldsI, InventoryImageI } from '~/server/models/InventoryItem';
import { requiredCurrencyRules } from '~/utils/validationFunctions';

defineProps({open: Boolean, onClose: Function });

const name = ref('');
const description = ref('');
const price = ref(0);
const tags = ref<TagI[]>([]);
const weight = ref<WeightI>({ units: 'pounds', quantity: 0 });
const inputFields = ref<CustomInputFieldsI[]>([]);


/** Image Stuff **/
const images = ref<(InventoryImageI & { location: string, data: File})[]>([]);

function addImages(files:File[]) {
  images.value.push(...files.map(file => {
    const imageUrl = URL.createObjectURL(file);
    return {
      location: imageUrl,
      name: file.name,
      altText: file.name,
      data: file
    }
  }));
}

function changeImageName(name: string, index: number) { images.value[index].name = name; }
function changeImageAlt(alt: string, index: number) { images.value[index].altText = alt; }
function moveImage(originalIndex: number, newIndex: number) {
  const temp = images.value[originalIndex];
  images.value[originalIndex] = images.value[newIndex];
  images.value[newIndex] = temp;
}
function removeImage(index: number) { images.value.splice(index, 1); }

</script>
<template>
  <v-dialog
    :model-value="open"
    fullscreen
    class="sans-serif"
  >
    <v-card
      title="Create Inventory Item"
    >
      <template v-slot:append>
        <v-btn
          icon="fas fa-times"
          @click="onClose"
        ></v-btn>
      </template>
      <v-container>
        <v-form @submit.prevent>
          <v-row>
            <v-col>
              <v-text-field
                v-model="name"
                label="Name"
                variant="outlined"
                required
                :rules="alphaNumericRules"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="description"
                label="Description"
                variant="outlined"
                :rules="alphaNumericRules"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="price"
                label="Price ($)"
                variant="outlined"
                required
                :rules="requiredCurrencyRules"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="weight.units"
                label="Weight Untis"
                variant="outlined"
                required
                :items="[
                  {title: 'Pounds', value: 'pounds'},
                  {title: 'Ounces', value: 'ounces'},
                  {title: 'Grams', value: 'grams'},
                ]"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="weight.quantity"
                label="Weight Quantity"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <ReusableImageEditor
                :images="images"
                :editing="true"
                @add-images="addImages"
                @change-image-name="changeImageName"
                @change-image-alt="changeImageAlt"
                @move-image="moveImage"
                @remove-image="removeImage"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card>
  </v-dialog>
</template>
