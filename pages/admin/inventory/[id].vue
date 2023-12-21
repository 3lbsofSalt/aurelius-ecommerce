<script setup lang="ts">
import type { InventoryImageI, InventoryItemI } from '~/server/models/InventoryItem';
import type { TagI } from '~/server/models/Tag';
definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
}

const errorStore = useErrorStore();


const editing = ref(false);

const route = useRoute();
const { data: item, error: getItemError, refresh: refetchItem } = await useFetch<InventoryItemI>('/api/inventory/' + route.params.id);

if(getItemError) {
  errorStore.error = 'There was an error getting the inventory item.';
}

const { data: tagList, error: tagError } = await useFetch<TagI[]>('/api/tags');

const editableItem = ref({...item.value});
const editableWeight = ref({ ...item.value?.weight });
const editableTags = ref([ ...(item.value?.tags || []).map((tag) => ({ title: tag.name, value: tag })) ]);
const editableInputFields = ref([ ...(item.value?.customerInputFields || []) ]);

async function reloadItem() {
  await refetchItem();
  editableItem.value = {...item.value};
  editableWeight.value = { ...item.value?.weight };
  editableTags.value = [ ...(item.value?.tags || []).map((tag) => ({ title: tag.name, value: tag })) ];
  editableInputFields.value = [ ...(item.value?.customerInputFields || []) ];
}


function addInputField() {
  editableInputFields.value.push({ name: '', type: 'text', description: '', required: false });
}
function deleteInputField(index: number) {
  editableInputFields.value.splice(index, 1);
}


// Note that any image in this array with an _id, is an image retrieved from the server, any without is a new image
const editableImages = ref<(InventoryImageI & { location: string, data?: File})[]>([ 
  ...(item.value?.images || [])
  .map((image) => ({ ...image, location: baseImageUrl(item.value?.baseImagePath || '', image)}))
]);

// Deleted Images will store only the _id of the images to be deleted, which will then be passed to the put endpoint.
const deletedImages = ref<string[]>([]);

async function saveOrEdit() {
  if(editing) {
    const formData = new FormData();
    formData.append('name', editableItem.value.name || '');
    formData.append('description', editableItem.value.description || '');
    formData.append('price', editableItem.value.price?.toString() || '');
    formData.append('tags', JSON.stringify(editableTags.value));
    formData.append('inputFields', JSON.stringify(editableInputFields.value) || '');
    formData.append('weightUnits', editableWeight.value.units || '');
    formData.append('weightQty', editableWeight.value.quantity?.toString() || '');
    formData.append('imagesToRemove', JSON.stringify(deletedImages.value) || '[]');
    for(const image of editableImages.value) {
      // An image with data and without an _id, is a new image that needs to be uploaded
      formData.append('images', image?.data || new Blob([]), image.name);
      formData.append('imagesData', JSON.stringify({ name: image.name, altText: image.altText }));
    }
    $fetch('/api/admin/inventory/' + item.value?._id, {
      method: 'put',
      body: formData
    })
      .then(() => { reloadItem(); })
      .catch(() => { errorStore.error = 'There was an error trying to update the item. Please try again.'; });
  }

  editing.value = !editing.value;
}


function addImages(files:File[]) {
  const tempNewImages = [...files.map(file => {
    const imageUrl = URL.createObjectURL(file);
    return {
      location: imageUrl,
      name: file.name,
      altText: file.name,
      data: file
    }
  })];
  editableImages.value.push(...tempNewImages);
}

function changeImageName(name: string, index: number) { editableImages.value[index].name = name; }
function changeImageAlt(alt: string, index: number) { editableImages.value[index].altText = alt; }
function moveImage(originalIndex: number, newIndex: number) {
  const temp = editableImages.value[originalIndex];
  editableImages.value[originalIndex] = editableImages.value[newIndex];
  editableImages.value[newIndex] = temp;
}
function removeImage(index: number) { 
  deletedImages.value.push(editableImages.value[index]._id || '');
  editableImages.value.splice(index, 1); 
}

function toggleActive() {
  if(editableItem.value.active) {
    $fetch('/api/admin/inventory/' + item.value?._id, { method: 'delete' }).then(() => { reloadItem(); });
  } else {
    $fetch('/api/admin/inventory/' + item.value?._id, { method: 'post' }).then(() => { reloadItem(); });
  }
}
</script>

<template>
  <v-card
    title="User Info"
    class="sans-serif"
  >
    <template v-slot:prepend>
      <v-btn 
        icon="fas fa-arrow-left"
        to="/admin/inventory"
      ></v-btn>
    </template>
    <template v-slot:append>
      <v-btn 
        prepend-icon="fas fa-ban" 
        color="admin"
        class="mr-3"
        v-if="editing"
        @click="() => { reloadItem(); editing = false; }"
      >Cancel</v-btn>
      <v-btn 
        :prepend-icon="editableItem.active ? 'fas fa-trash-can' : 'fas fa-trash-can-arrow-up'" 
        :color="editableItem.active ? 'error' : 'admin'"
        class="mr-3"
        @click="toggleActive"
      >{{'Make ' + (editableItem.active ? 'Inactive' : 'Active')}}</v-btn>
      <v-btn 
        color="admin"
        @click="saveOrEdit"
      >{{editing ? 'Save' : 'Edit'}}</v-btn>
    </template>
    <v-card-text>
      <div></div>
      <v-row>
        <v-col>
          <v-text-field 
            label="Name"
            v-model="editableItem.name"
            variant="outlined"
            :readonly="!editing"
            :rules="requiredAlphaNumericRules"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field 
            label="Description"
            v-model="editableItem.description"
            variant="outlined"
            :readonly="!editing"
            :rules="wideRangeAlphaNumericRules"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-text-field
            v-model="editableItem.price"
            label="Price ($)"
            variant="outlined"
            required
            :readonly="!editing"
            :rules="requiredCurrencyRules"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-combobox
            v-model="editableTags"
            label="Tags"
            variant="outlined"
            multiple
            chips
            required
            :readonly="!editing"
            :items="(tagList || []).map(tag => ({ title: tag.name, value: tag }))"
          ></v-combobox>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="editableWeight.units"
            label="Weight Units"
            variant="outlined"
            required
            :readonly="!editing"
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
            v-model="editableWeight.quantity"
            label="Weight Quantity"
            variant="outlined"
            :readonly="!editing"
            :rules="requiredPositiveIntegerRules"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <ReusableImageEditor
            :images="editableImages"
            :editing="editing"
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
          <div class="text-h4">Customer Inputs</div>
        </v-col>
      </v-row>
      <template v-for="fields in editableInputFields">
        <v-row>
          <v-col>
            <v-text-field
              v-model="fields.name"
              label="Field Name"
              variant="outlined"
              required
              :readonly="!editing"
              :rules="requiredAlphaNumericRules"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row >
          <v-col>
            <v-select
              v-model="fields.type"
              label="Data Type"
              variant="outlined"
            :readonly="!editing"
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
              :readonly="!editing"
              v-model="fields.required"
            ></v-checkbox>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              label="Description"
              v-model=fields.description
              variant="outlined"
              :readonly="!editing"
              :rules="wideRangeAlphaNumericRules"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-divider
          class="ma-4"
        ></v-divider>
        <v-btn 
          block
          prepend-icon="fas fa-trash-can"
          color="error"
          @click="deleteInputField(i)"
          v-if="editing"
        >Delete Field</v-btn>
      </template>
      <v-btn
        block
        @click="addInputField"
        :disabled="!editing"
      >Add Customer Input Field</v-btn>
    </v-card-text>
  </v-card>
</template>
