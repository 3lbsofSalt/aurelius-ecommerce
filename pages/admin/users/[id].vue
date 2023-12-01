<script setup lang="ts">
const errorStore = useErrorStore();

import type { UserI } from '~/server/models/User';
definePageMeta({
  layout: 'admin'
});

const route = useRoute();

const editing = ref(false);
const { data: user, error, refresh: refetchUser } = await useFetch<UserI>('/api/admin/users/' + route.params.id).catch(() => { errorStore.error = 'There was an error getting the user.' });
const editableUser = ref({...user.value});

const { data: groups } = await useFetch('/api/admin/privilegegroups').catch(() => { errorStore.error = 'There was an error getting the privilege groups.'; });

console.log(user.value);
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
      .then(() => {
        refetchUser();
      })
      .catch(() => { errorStore.error = 'There was an error updating the user' })
  }

  editing.value = !editing.value;
}

</script>

<template>
  <v-card
    title="User Info"
    class="sans-serif"
  >
    <template v-slot:append>
      <v-btn @click="saveOrEdit">{{editing ? 'Save' : 'Edit'}}</v-btn>
    </template>
    <v-card-text>
      <div></div>
      <v-text-field 
        label="User Name"
        v-model="editableUser.name"
        variant="outlined"
        :disabled="!editing"
      ></v-text-field>
      <v-text-field 
        label="Email"
        v-model="editableUser.email"
        variant="outlined"
        :disabled="!editing"
      ></v-text-field>
      <v-text-field 
        label="Phone Number"
        v-model="editableUser.phone"
        variant="outlined"
        :disabled="!editing"
      ></v-text-field>
      <v-text-field 
        label="Privilege Group"
        v-model="editableUser.permissionGroup"
        variant="outlined"
        :disabled="!editing"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>
