<script setup lang="ts">
import type { TagI } from '~/server/models/Tag';
import type { WeightI } from '~/server/models/InventoryItem';

defineProps({open: Boolean, onClose: Function });

const name = ref('');
const description = ref('');
const price = ref(0);
const tags = ref<TagI[]>([]);
const weight = ref<WeightI>({ units: 'pounds', quantity: 0 });


const { data: routePrivs, error: permissionsError } = await useFetch('/api/checkAuthRoutes');
if(permissionsError.value || !routePrivs.value.includes('Inventory')) {
  navigateTo('/');
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
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col></v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card>
  </v-dialog>
</template>
