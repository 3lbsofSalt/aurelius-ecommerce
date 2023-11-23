import { defineStore } from 'pinia';

interface State {

}

export const useAuthStore = defineStore('auth', {

  actions: {
    async login (email: string, password: string) {

      const res = await $fetch('/api/auth/login', {
        method: 'post',
        body: {
          email,
          password
        }
      });

      console.log(res);

      /*
      commit('SET_USER', user);
      this.$router.push('/');

    } catch (error) {
      if(!error.response) {
        console.log(error);
        return;
      }
      const data = error.response.data;
      if(data.code === 'INVALID_USER') {
        return 'invalid';
      } else {
        return 'unavailable';
      }
    }

*/
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


