import { defineStore } from 'pinia';

interface State {
  error: string | string[],
  validation: boolean
}

export const useErrorStore = defineStore('error', {
  state: (): State => ({
    error: '',
    validation: false
  }),

  getters: {
    isError: state => {
      return state.error !== ''
    }
  },

  actions: {
    handleCatch(res:any, defaultError: string) {
      if(res?.response?.data.code === 'VALIDATOR_INVALID_REQUEST_BODY') {
        const data = res.response.data;
        this.validation = true;
        this.error = data.validationErrors;
      } else {
        this.error = defaultError;
      }
    },

    unset() {
      this.$reset();
    }
  }

});

