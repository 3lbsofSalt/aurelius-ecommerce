import { defineStore } from 'pinia';

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
  actions: {
    async checkForSession() {
      const res = await useFetch('/api/session');

      this.email = res.data?.user?.email || '';
      this.name = res.data?.user?.name || '';
      this.id = res.data?.user?._id || '';
      this.permissionGroup = res.data?.user?.permissionGroup || 'Basic';
    }
  }
});

/*
import cookies from 'js-cookie';

export const state = () => ({
  user: {}
});

export const getters = {

  user: (state) => {
    return state.user;
  },

  isLoggedIn: (state) => {
    if(state.user?._id) {
      return true;
    } else {
      return false;
    }
  },

  isAdmin: (state) => {
    return state.user?.isAdmin
  },

}

export const mutations = {

  SET_USER (state, user) {
    state.user = user;
  },

  LOGOUT (state) {
    state.user = null;
  }

};

export const actions = {


  logout ({ commit }) {
    commit('LOGOUT');
    this.$router.push('/');
  },

  access ({ rootState }, params) {
    this.$fetch.$post('/auth/privileges/access', {
      path: params.path
    }).catch((error) => {
      this.$router.push('/');
    });
  }

};
*/


