<script setup lang="ts">
const { signIn } = useAuth();

import { useAuthState } from '#imports';

defineProps(['open', 'onClose']);

const email = ref('');
const password = ref('');

async function handleLogin() {
  const ret = await signIn('credentials', { callbackUrl: '/', email:email.value, password:password.value });
}

</script>

<template>
  <v-container class="fill-height">
    <v-row
      style="height: 70vh; "
      class="d-flex justify-center align-center"
    >
      <v-col></v-col>
      <v-col>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Email"
            variant="outlined"
            :rules="emailRules"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            type="password"
            label="Password"
            variant="outlined"
            :rules="passwordRules"
            required
          ></v-text-field>
          <v-btn
            block
            class="text-primary sans-serif font-weight-bold"
            color="primary"
            variant="outlined"
            rounded="0"
            type="submit"
            size="x-large"
          >Login</v-btn>
        </v-form>
        <v-btn
          block
          class="text-primary sans-serif font-weight-bold mt-2"
          color="primary"
          variant="tonal"
          rounded="0"
          size="x-large"
          append-icon="fab fa-github"
          @click="() => signIn('github', { callbackUrl: '/' })"
        >Sign In With Github</v-btn>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

