<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const { status, data, signOut, signIn } = useAuth();

defineProps(['open', 'onClose']);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const name = ref('');
const phone = ref('');

const confirmPasswordRules = [
  (v: string) => !!v || 'You must confirm your password',
  (v: string) => v === password.value || 'Does not match your password'
];

async function signUp() {
  const res = await $fetch('/api/signup', {
    method: 'POST',
    body: {
      email: email.value,
      password: password.value,
      name: name.value,
      phone: phone.value
    }
  });
  
  if(res.status === 200) {
    signIn('credentials', { email, password });
  }

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
        <v-form @submit.prevent="() => signUp()">
          <v-text-field
            v-model="email"
            label="Email"
            variant="outlined"
            required
            :rules="emailRules"
          ></v-text-field>
          <v-text-field
            v-model="password"
            type="password"
            label="Password"
            variant="outlined"
            required
            :rules="passwordRules"
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            type="password"
            label="Confirm Password"
            variant="outlined"
            required
            :rules="confirmPasswordRules"
          ></v-text-field>
          <v-text-field
            v-model="name"
            label="Name"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="phone"
            label="Phone"
            variant="outlined"
          ></v-text-field>
          <v-btn
            block
            class="text-primary sans-serif font-weight-bold"
            color="primary"
            variant="outlined"
            rounded="0"
            type="submit"
            size="x-large"
          >Sign Up</v-btn>
        </v-form>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

