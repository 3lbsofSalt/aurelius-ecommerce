import { defineStore } from 'pinia';
import { UserI } from '~/server/models/User';

interface State {
  email: string,
  name: string,
  id: string,
  permissionGroup: string
}

export const useAuthStore = defineStore('auth', {
  state: (): UserI => ({
    email: '',
    name: '',
    _id: -10,
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
      const { data: user, error } = await useFetch<UserI>('/api/session');

      if(error.value) {
        return this.$reset();
      }

      this.email = user.value?.email || '';
      this.name = user.value?.name || '';
      this._id = user.value?._id || -10;
      this.permissionGroup = user.value?.permissionGroup || 'Basic';
    }
  }
});
