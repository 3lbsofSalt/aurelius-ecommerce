<script setup lang="ts">
import type { PrivilegeI } from '~/server/models/Privileges';
import type { RoutePrivilegesI } from '~/server/models/RoutePrivileges';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Privileges')) {
  navigateTo('/');
}

const errorStore = useErrorStore();

// This is all for managing the groups
const { data: privilegeGroups, refresh: refreshGroups } = await useFetch<PrivilegeI[]>('/api/admin/privilegegroups');
const group = ref('')
const makingGroup = ref(false);

async function createGroup() {
  $fetch('/api/admin/privilegegroups', {
    method: 'post',
    body: {
      group: group.value
    }
  })
    .then(() => { refreshGroups(); })
    .catch(() => { errorStore.error = 'There was an error getting the privilege groups.'; })
    .finally(() => { makingGroup.value = false; });
}

async function deleteGroup(group:string) {
  $fetch('/api/admin/privilegegroups', {
    method: 'delete',
    query: {
      group 
    }
  })
    .then(() => { refreshGroups(); })
    .catch(() => { errorStore.error = 'There was an error deleting the privilege group' });
}

function openGroupCreate() { makingGroup.value = true; }


// This is all for managing the groups that are attached to routes
const editingGroup = ref(false);
const groupBeingEdited = ref('');
const groupBeingEditedPrivileges : Ref<string[]> = ref([]);

const { data: routePrivileges, refresh: refreshRoutePrivileges } = await useFetch<RoutePrivilegesI[]>('/api/admin/routeprivileges');

function startEditingGroup(routeToEdit:string) { 
  editingGroup.value = true; 
  groupBeingEdited.value = routeToEdit; 
  groupBeingEditedPrivileges.value = [...(getCurrentlyEditedRoute(routeToEdit) || [])];
}

function getCurrentlyEditedRoute(routeToEdit: string) {
  return routePrivileges?.value?.find((route) => route.name === routeToEdit)?.groups;
}

function isChecked(groupToCheck: string) { 
  return groupBeingEditedPrivileges.value.includes(groupToCheck);
}

function toggleGroup(groupToToggle: string) {
  if(!isChecked(groupToToggle)) {
    groupBeingEditedPrivileges.value.push(groupToToggle);
  } else {
    groupBeingEditedPrivileges.value.splice(groupBeingEditedPrivileges.value.indexOf(groupToToggle), 1);
  }

}

async function saveRoutePrivileges() {
  $fetch('/api/admin/routeprivileges', {
    method: 'put',
    body: {
      name: groupBeingEdited.value,
      groups: groupBeingEditedPrivileges.value
    }
  })
    .then(() => {
      editingGroup.value = false;
    })
    .catch(() => {
      errorStore.error = 'There was an error updating the route privileges';
    })
    .finally(() => {
      refreshRoutePrivileges();
    })
      
}
</script>

<template>

  <v-card
    class="sans-serif font-weight-light"
    rounded="0"
    title="Location Permissions"
  >
    <v-list
      density="compact"
    >
      <v-list-item 
        v-for="route in routePrivileges"
        :title="route.name"
      >
        <template v-slot:append>
          <v-chip
            class="mr-2"
          >Admin</v-chip>
          <v-chip
            class="mr-2"
            v-for="routeGroup in route.groups"
          >{{routeGroup}}</v-chip>
          <v-btn 
            class="ml-2"
            variant="outlined"
            @click="startEditingGroup(route.name)"
          >
            Edit
          </v-btn>
        </template>
      </v-list-item>
      <v-dialog
        v-model="editingGroup"
        width="500"
      >
        <v-card
          title="Editing Group Routes"
          class="sans-serif"
        >
          <v-list density="compact">
            <v-list-item>
              <v-checkbox
                :model-value="true"
                label="Admin"
                disabled
              ></v-checkbox>
            </v-list-item>
            <v-list-item 
              v-for="group in privilegeGroups"
            >
              <v-checkbox
                :model-value="isChecked(group.group)"
                :label="group.group"
                @update:model-value="() => toggleGroup(group.group)"
              ></v-checkbox>
            </v-list-item>
            <v-list-item>
              <v-checkbox
                :checked="isChecked('Basic')"
                label="Basic"
              ></v-checkbox>
            </v-list-item>
          </v-list>
          <v-card-actions>
            <v-btn
              @click="saveRoutePrivileges"
            >Update</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list>
  </v-card>



  <v-card
    class="sans-serif mt-3"
    rounded="0"
    title="Permission Groups"
  >
    <template v-slot:append>
      <v-btn @click="openGroupCreate">
        Add Group
        <v-dialog 
          v-model="makingGroup"
          width="500"
        >
          <template v-slot:default>
            <v-card 
              title="Create a Group"
            >
              <v-form @submit.prevent="createGroup">
              <v-card-text>
                <v-text-field
                  label="Group Name"
                  v-model="group"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-card-text>
                <v-card-actions>
                  <v-btn
                    type="submit"
                  >Create Group</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </template>
        </v-dialog>
      </v-btn>
    </template>
    <v-list
      density="compact"
    >
      <v-list-item title="Admin">
        <template v-slot:append>
          <v-btn class="error" disabled icon="fas fa-trash"></v-btn>
        </template>
      </v-list-item>
      <v-list-item 
        v-for="route in privilegeGroups"
        :title="route.group"
      >
        <template v-slot:append>
          <v-btn 
            class="text-error" 
            icon="fas fa-trash"
            @click="deleteGroup(route.group)"
          ></v-btn>
        </template>
      </v-list-item>
      <v-list-item title="Basic">
        <template v-slot:append>
          <v-btn class="error" disabled icon="fas fa-trash"></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
