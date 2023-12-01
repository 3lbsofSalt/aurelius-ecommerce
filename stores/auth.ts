import { defineStore } from 'pinia';
import type { userRes } from '../utils/useFetch.d.ts';

interface State {
  email: string,
  name: string,
  id: string,
  permissionGroup: string
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    email: '',
    name: '',
    id: '',
    permissionGroup: 'Basic'
  }),
  getters: {
    isLoggedIn: (state) : boolean => {
      if(!state.email || state.email == '') return false;
      return true;
    },
    isAdmin: (state) : boolean => {
      if(!state.permissionGroup || state.permissionGroup === 'Basic') {
        return false;
      }
      return true;
    }
  },
  actions: {
    async checkForSession() {
      const { data, error } = await useFetch('/api/session');

      if(error.value) {
        console.log(error.value);
        return this.$reset();
      }

      this.email = data.value.user.email || '';
      this.name = data.value.user.name || '';
      this.id = data.value.user._id || '';
      this.permissionGroup = data.value.user.permissionGroup || 'Basic';
    }
  }
});
