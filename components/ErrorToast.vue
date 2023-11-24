<script setup lang="ts">
import { useErrorStore } from '~/stores/error';
defineProps(['visible', 'message']);
const errorStore = useErrorStore();
const { isError } = storeToRefs(errorStore);

const isValidationError = ref(false);
const errorText = ref('');

function close() {
  errorStore.unset();
}

</script>

<template>
  <v-snackbar
    inset
    :veritcal="isValidationError"
  >
    <v-icon
      color="error"
      icon="fa-triangle-exclamation"
    >
    </v-icon>
    <template
      v-if="isValidationError"
    >
      Some of the data sent to the server was incorrect:
      <v-list
        dense
      >
        <v-list-item
          v-for="(error, index) in errorText"
          :key="index"
        >
          {{ error }}
        </v-list-item>
      </v-list>
    </template>
    <template
      v-else
    >
      {{  message }}
    </template>
    <template v-slot:action="{ attrs }">
      <v-btn
        color="red"
        @click="close"
        text
        v-bind="attrs"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

