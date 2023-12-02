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
      const { data: user, error } = await useFetch('/api/session');

      console.log(user.value);

      if(error.value) {
        console.log(error.value);
        return this.$reset();
      }

      this.email = user.value.email || '';
      this.name = user.value.name || '';
      this.id = user.value._id || '';
      this.permissionGroup = user.value.permissionGroup || 'Basic';
    }
  }
});
