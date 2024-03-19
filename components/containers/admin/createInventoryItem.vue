<script setup lang="ts">

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

import type { TagI } from '~/server/models/Tag';
import type { WeightI, CustomInputFieldsI, InventoryImageI } from '~/server/models/InventoryItem';
import { isPositiveInteger, requiredCurrencyRules } from '~/utils/validationFunctions';

import { useErrorStore } from '~/stores/error';
const errorStore = useErrorStore();
const props = defineProps({open: Boolean});
const emit = defineEmits<{ (e: 'close') : void }>();

// Checks wether the item is currently being uploaded or not.
const uploading = ref(false);

const name = ref('');
const description = ref('');
const price = ref('0');
const tags = ref<TagI[]>([]);
const weight = ref<WeightI>({ units: 'pounds', quantity: 0 });
const inputFields = ref<CustomInputFieldsI[]>([]);
const images = ref<(InventoryImageI & { location: string, data: File})[]>([]);
const length = ref<string>('0');
const width = ref<string>('0');
const height = ref<string>('0');
const shipIndividually = ref<boolean>(false);
const boxLength = ref(0);
const boxWidth = ref(0);
const boxHeight = ref(0);

const { data: tagList, error: tagError, refresh: tagRefresh } = await useFetch<TagI[]>('/api/tags');

watch(() => props.open, (newOpen) => {
  tagRefresh();
  if(newOpen) {
    name.value = '';
    description.value = '';
    price.value = '0';
    tags.value = [];
    weight.value = { units: 'pounds', quantity: 0 };
    inputFields.value = [];
    images.value = [];
    length.value = '0';
    width.value = '0';
    height.value = '0';
    shipIndividually.value = false;
    boxLength.value = 0;
    boxHeight.value = 0;
    boxWidth.value = 0;
  }
});


/** Input Fields Stuff **/
function addInputField() { inputFields.value.push({ type: 'text', required: false, description: '', name: '' }); }
function deleteInputField(i: number) { inputFields.value.splice(i, 1); }

/** Image Stuff **/

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

/** End Image Stuff **/

function createItem() {
  const formData = new FormData();
  formData.append('name', name.value);
  formData.append('description', description.value);
  formData.append('price', price.value);
  formData.append('tags', JSON.stringify(tags.value));
  formData.append('weightUnits', weight.value.units);
  formData.append('weightQty', weight.value.quantity.toString());
  formData.append('inputFields', JSON.stringify(inputFields.value));
  formData.append('dimensions', JSON.stringify({
    length: parseFloat(length.value),
    width: parseFloat(width.value),
    height: parseFloat(height.value)
  }));
  formData.append('shipIndividually', JSON.stringify(shipIndividually.value));
  formData.append('individualPackageDimensions', JSON.stringify({ length: boxLength.value, width: boxWidth.value, height: boxHeight.value }));
  for(const image of images.value) {
    formData.append('images', image.data, image.name);
    formData.append('imagesData', JSON.stringify({ name: image.name, altText: image.altText }));
  }

  uploading.value = true;

  $fetch('/api/admin/inventory', {
    method: 'post',
    body: formData
  })
    .then(() => { emit('close'); })
    .catch(() => { errorStore.error = 'There was an error creating the item.' })
    .finally(() => { uploading.value = false });

}

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
          @click="$emit('close')"
        ></v-btn>
      </template>
      <v-container>
        <v-form @submit.prevent="createItem">
          <v-row>
            <v-col>
              <v-text-field
                v-model="name"
                label="Name *"
                variant="outlined"
                required
                :rules="requiredAlphaNumericRules"
                :disabled="uploading"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="description"
                label="Description"
                variant="outlined"
                :disabled="uploading"
                multiline
                :rules="wideRangeAlphaNumericRules"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="price"
                label="Price ($) *"
                variant="outlined"
                :disabled="uploading"
                required
                :rules="requiredCurrencyRules"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-combobox
                v-model="tags"
                label="Tags"
                variant="outlined"
                multiple
                :disabled="uploading"
                chips
                required
                :items="(tagList || []).map(tag => ({ title: tag.name, value: tag }))"
              ></v-combobox>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <ReusableImageEditor
                :disabled="uploading"
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
          <v-row>
            <v-col>
              <div>Shipping Info</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="weight.units"
                label="Weight Units *"
                :disabled="uploading"
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
                v-model.number="weight.quantity"
                label="Weight Quantity *"
                :disabled="uploading"
                variant="outlined"
                :rules="requiredPositiveIntegerRules"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="length"
                label="Length (in.) *"
                variant="outlined"
                :disabled="uploading"
                :rules="requiredPositiveNumberRules"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="width"
                label="Width (in.) *"
                variant="outlined"
                :disabled="uploading"
                :rules="requiredPositiveNumberRules"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="height"
                label="Height (in.) *"
                :disabled="uploading"
                variant="outlined"
                :rules="requiredPositiveNumberRules"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-checkbox
                v-model="shipIndividually"
                :disabled="uploading"
                label="Ship Individually * (This item will be shipped in its own box)"
                required
              ></v-checkbox>
            </v-col>
          </v-row>
          <template
            v-if="shipIndividually"
          >
            <v-row>
              <v-col>
                <v-text-field
                  v-model.number="boxLength"
                  label="Length (in.) of Preferred Shipping Box *"
                  variant="outlined"
                  :disabled="uploading"
                  :rules="requiredPositiveNumberRules"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model.number="boxWidth"
                  label="Width (in.) of Preferred Shipping Box *"
                  variant="outlined"
                  :disabled="uploading"
                  :rules="requiredPositiveNumberRules"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model.number="boxHeight"
                  label="Height (in.) of Preferred Shipping Box *"
                  :disabled="uploading"
                  variant="outlined"
                  :rules="requiredPositiveNumberRules"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </template>
          <v-row>
            <v-col>
              <div class="text-h4">Customer Inputs</div>
            </v-col>
          </v-row>
          <template v-for="fields in inputFields">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="fields.name"
                  label="Field Name *"
                  variant="outlined"
                  :disabled="uploading"
                  required
                  :rules="requiredWideRangeAlphaNumericRules"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row >
              <v-col>
                <v-select
                  v-model="fields.type"
                  label="Data Type"
                  variant="outlined"
                  :disabled="uploading"
                  :items="[
                    { value: 'text', title: 'Text' },
                    { value: 'download', title: 'File' }
                  ]"
                  required
                ></v-select>
              </v-col>
              <v-col>
                <v-checkbox
                  label="Required"
                  v-model="fields.required"
                  :disabled="uploading"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  label="Description"
                  v-model=fields.description
                  variant="outlined"
                  :rules="wideRangeAlphaNumericRules"
                  :disabled="uploading"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn 
              block
              prepend-icon="fas fa-trash-can"
              color="error"
              @click="deleteInputField(i)"
              :disabled="uploading"
            >Delete Field</v-btn>
            <v-divider
              class="ma-4"
            ></v-divider>
          </template>
          <v-btn
            block
            @click="addInputField"
            :disabled="uploading"
          >Add Customer Input Field</v-btn>
          <v-divider
            class="ma-4"
          ></v-divider>
          <v-btn
            color="admin"
            block
            type="submit"
            :disabled="uploading"
          >
            Create Item
          </v-btn>
        </v-form>
      </v-container>
    </v-card>
  </v-dialog>
  <v-snackbar
    class="text-primary sans-serif"
    v-model="uploading"
  >Item Uploading</v-snackbar>
</template>
