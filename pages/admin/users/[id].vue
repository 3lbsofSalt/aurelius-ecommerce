<script setup lang="ts">
const errorStore = useErrorStore();

import type { PrivilegeI } from '~/server/models/Privileges';
import type { UserI } from '~/server/models/User';
import { alphaNumericRules, phoneNumberRules } from '~/utils/validationFunctions';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Users')) {
  navigateTo('/');
}

const route = useRoute();

const editing = ref(false);
const { data: user, error: getUserError, refresh: refetchUser } = await useFetch<UserI>('/api/admin/users/' + route.params.id);

async function reloadUser() {
  await refetchUser();
  editableUser.value = {...user.value};
}

if(getUserError) {
  errorStore.error = 'There was an error getting the user.';
}
const editableUser = ref({...user.value});

const { data: groups, error: pGroupError } = await useFetch<PrivilegeI[]>('/api/admin/privilegegroups')

if(pGroupError) { errorStore.error = 'There was an error getting the privilege groups.'; }

async function saveOrEdit() {
  if(editing) {
    $fetch('/api/admin/users/' + user.value?._id, {
      method: 'put',
      body: {
        name: editableUser.value.name,
        email: editableUser.value.email,
        phone: editableUser.value.phone,
        permissionGroup: editableUser.value.permissionGroup
      }
    })
      .then(() => { reloadUser(); })
      .catch(() => { errorStore.error = 'There was an error updating the user' })
  }

  editing.value = !editing.value;
}

const permissionGroupRules = [
  (v : string) => !!v || 'Must have a privilege group.',
  (v : string) => v === 'Admin' || v === 'Basic' || !!(groups.value?.find(g => g.group === v)) || 'The group is not in the valid list of privilege groups.'
]

</script>

<template>
  <v-card
    title="User Info"
    class="sans-serif"
  >
    <template v-slot:prepend>
      <v-btn 
        icon="fas fa-arrow-left"
        to="/admin/users"
      ></v-btn>
    </template>
    <template v-slot:append>
      <v-btn 
        prepend-icon="fas fa-ban" 
        color="admin"
        class="mr-3"
        v-if="editing"
        @click="() => { reloadUser(); editing = false; }"
      >Cancel</v-btn>
      <v-btn 
        color="admin"
        @click="saveOrEdit"
      >{{editing ? 'Save' : 'Edit'}}</v-btn>
    </template>
    <v-card-text>
      <div></div>
      <v-text-field 
        label="Name"
        v-model="editableUser.name"
        variant="outlined"
        :disabled="!editing"
        :rules="alphaNumericRules"
      ></v-text-field>
      <v-text-field 
        label="Email"
        v-model="editableUser.email"
        variant="outlined"
        :disabled="!editing"
        :rules="emailRules"
      ></v-text-field>
      <v-text-field 
        label="Phone Number"
        v-model="editableUser.phone"
        variant="outlined"
        :disabled="!editing"
        :rules="phoneNumberRules"
      ></v-text-field>
      <v-select
        label="Privilege Group"
        v-model="editableUser.permissionGroup"
        variant="outlined"
        :disabled="!editing"
        :items="['Admin', ...(groups?.map((priv) => priv.group) || []), 'Basic']"
        :rules="permissionGroupRules"
      ></v-select>
    </v-card-text>
  </v-card>
</template>
