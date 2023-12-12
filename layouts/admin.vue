<script setup lang="ts">
const authStore = useAuthStore();
const drawer = ref('false');

onMounted(async () => {
  await authStore.checkForSession();
  if (authStore.email === '' || authStore.permissionGroup == 'Basic') {
    await navigateTo({ path: '/' });
  }
});
</script>

<template>
  <v-app class="bg-grey-lighten-2">
    <v-navigation-drawer
      class="bg-admin"
      app
    >
      <v-list nav>
        <v-list-item
          class="sans-serif"
        ></v-list-item>
        <v-list-item
          href="/admin/inventory"
          class="sans-serif"
          prepend-icon="fas fa-boxes"
          title="Inventory"
        ></v-list-item>
        <v-list-item
          href="/admin/users"
          class="sans-serif"
          prepend-icon="fas fa-user"
          title="Users"
        ></v-list-item>
        <v-list-item
          href="/admin/privileges"
          class="sans-serif"
          prepend-icon="fas fa-key"
          title="Privileges"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <div class="pa-4">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>
