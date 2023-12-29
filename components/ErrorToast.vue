<script setup lang="ts">
const errorStore = useErrorStore();
const { isError } = storeToRefs(errorStore);

function close() {
  errorStore.unset();
}

</script>

<template>
  <v-snackbar
    v-model="isError"
    inset
    class="sans-serif"
  >
    <v-icon
      color="error"
      icon="fas fa-triangle-exclamation"
      class="mr-4"
    >
    </v-icon>
    {{ errorStore.error }}
    <template v-slot:actions>
      <v-btn
        color="red"
        @click="close"
        class="sans-serif"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

