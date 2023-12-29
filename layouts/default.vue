<script setup lang="ts">

const { signOut } = useAuth();
const authStore = useAuthStore();
const errorStore = useErrorStore();
const { isError } = storeToRefs(errorStore);

const drawer = ref(false);

async function handleSignOut() {
  await signOut();
}

</script>

<template>
  <v-app>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
    >

    </v-navigation-drawer>

    <v-app-bar
      app
      height="130"
      elevation="0"
    >
      <v-container
        class="d-flex justify-space-between align-center"
        fluid
      >
        <NuxtLink
          to="/"
        >
          <v-btn
            icon="fas fa-jedi"
            style="margin-left: 12vh"
            class="text-primary"
            size="x-large"
          >
          </v-btn>
        </NuxtLink>
        <div>
          <v-btn
            class="sans-serif font-weight-bold text-primary"
            variant="text"
          >Custom Prints/Products</v-btn>
          <v-btn
            class="sans-serif font-weight-bold text-primary"
            variant="text"
          >Merchandise</v-btn>
        </div>
        <div
          class="d-flex justify-space-around align-center pr-6"
        >
          <v-divider
            vertical
            class="text-primary bg-primary border-opacity-100"
            color="primary"
          ></v-divider>
          <v-icon
            class="mx-3 text-primary"
            icon="fas fa-search"
          ></v-icon>
          <v-divider
            vertical
            class="text-primary bg-primary border-opacity-100"
            color="primary"
          ></v-divider>
          <v-btn
            class="pa-0"
            color="primary"
            rounded="0"
          >
            <v-icon
              class="ml-3 text-primary"
              icon="fas fa-user"
              size="large"
            ></v-icon>
            <v-icon
              size="x-small"
              class="mr-3 text-primary"
              icon="fas fa-angle-down"
            ></v-icon>

            <v-menu activator="parent">
              <v-list v-if="!authStore.isLoggedIn">
                <v-list-item
                  class="sans-serif text-primary"
                  to="/login"
                >Sign In</v-list-item>
                <v-list-item
                  class="sans-serif text-primary"
                  to="/signup"
                >Sign Up</v-list-item>
              </v-list>
              <v-list v-else>
                <v-list-item
                  v-if="authStore.isAdmin"
                  class="sans-serif text-primary"
                  to="/admin/privileges"
                >Admin Panel</v-list-item>
                <v-list-item
                  class="sans-serif text-primary"
                  @click="handleSignOut"
                >
                  Sign Out
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
          <v-divider
            vertical
            class="text-primary bg-primary border-opacity-100"
            color="primary"
          ></v-divider>
          <v-btn
            class="pa-0 text-primary"
            color="primary"
            rounded="0"
            icon="fas fa-shopping-cart"
            to="/cart"
          ></v-btn>
          <v-divider
            vertical
            class="text-primary bg-primary border-opacity-100"
            color="primary"
          ></v-divider>
        </div>
      </v-container>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>

    <ErrorToast
      :visible="isError"
      :message="errorStore.error"
    />

  </v-app>
</template>

<style scoped>
.fullWidth {
  width: 100%;
}

.fullHeight {
  height:"100%";
}
</style>

