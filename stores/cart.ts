import { defineStore } from 'pinia';
import safeAwait from 'safe-await';
import type { InventoryItemI } from '~/server/models/InventoryItem';
import { UserI } from '~/server/models/User';
import type { CartI, CartItemI } from '~/server/models/subdocuments/Cart';
import { emptyCart } from '~/server/models/subdocuments/Cart';

interface State {
  cart: CartI
}

export const useCartStore = defineStore('cart', {
  state: (): State => ({
    cart: emptyCart
  }),

  getters: {
    isEmpty: (state) => state.cart.items.length <= 0,
    total: (state) => state.cart.items.reduce((accumulator, item) => (
      accumulator + (Number.parseInt(item.item.price.toString()) * Number.parseInt(item.quantity.toString()))
    ), 0),
    totalQuantity: (state) => state.cart.items.reduce((accumulator, item) => (
      accumulator + Number.parseInt(item.quantity.toString())
    ), 0),
    totalWeightGrams: (state) => {
      return state.cart.items.reduce((accumulator, item) => { 
        let weightGrams = item.item.weight?.quantity || 0;
        if(item.item.weight?.units === 'pounds') {
          weightGrams *= 453.5924;
        } else if(item.item.weight?.units === 'ounces') {
          weightGrams *= 28.34952;
        }

        return accumulator + weightGrams * item.quantity;
      }, 0)
    }
  },

  actions: {
    async addToCart(item: InventoryItemI, quantity: number, inputFields: (string | File[])[]) {
      const errorStore = useErrorStore();

      // Setup the fieldAnswers array from inputFields
      const fieldAnswers = await this.serializeInputFields(item, inputFields);
      if(errorStore.isError) return;

      const hasFields = (item?.customerInputFields?.length || 0) > 0;

      const cartItem : CartItemI = {
        item,
        quantity,
        fieldAnswers: fieldAnswers || [],
      };

      const itemAlreadyInCartIndex = this.cart.items.findIndex((cartItem) => cartItem.item._id == item._id);
      // If it has fields we always push a new item. Also if it's not already in the cart
      if(hasFields || itemAlreadyInCartIndex === -1) {
        this.cart.items.push(cartItem);
      } else { // Updating an item that was already in the cart
        this.cart.items[itemAlreadyInCartIndex].quantity += quantity;
      }

      await this.saveCartToStorage();
    },
    removeItemFromCart(index: number) {
      this.cart.items.splice(index, 1);
      this.saveCartToStorage();
    },
    updateTotalQuantity(itemId: number, newQuantity: number) {
      newQuantity = Number.parseInt(newQuantity.toString());

      const itemIndex = this.cart.items.findIndex(cartItem => itemId == cartItem.item._id);
      this.cart.items[itemIndex].quantity = newQuantity;
      this.saveCartToStorage();
    },
    async serializeInputFields(item: InventoryItemI, inputFields: (string | File[])[]) {
      const errorStore = useErrorStore();
      const fieldAnswers : (string | undefined)[] = [];
      for(const fieldIndex in inputFields) {
        const input = inputFields[fieldIndex];
        const itemInput = item.customerInputFields?.[fieldIndex];

        if(itemInput?.type === 'text') {

          if(!input && itemInput.required) { errorStore.error = 'A required text input was not filled.'; return; }
          fieldAnswers.push(input as string);

        } else if(itemInput?.type === 'download') { 
          const file = input[0] as File;

          if((!file || file.size <= 0) && itemInput.required) { // Required file not given
            errorStore.error = 'A required file upload was not given.'; 
            return []; 
          } else if(!file || file.size <= 0) { // No File given
            fieldAnswers.push(undefined);
          } else {
            const formData = new FormData();
            formData.append('images', file, file.name);
            //@ts-ignore There's an "excessive depth warning"
            const [imageError, imageLocation] = await safeAwait( $fetch('/api/images', { method: 'post', body: formData }));

            if(imageError) { errorStore.error = 'There was an error uploading one of the images. Check your images and try again.'; return; }
            fieldAnswers.push(imageLocation[0] as string);
          }

        } else { // Type is not valid
          fieldAnswers.push(undefined);
        }
      }
      return fieldAnswers;
    },
    async initializeCart() {
      const authStore = useAuthStore();
      const errorStore = useErrorStore();
      const cookie = useCookie('cart');

      if(authStore.isLoggedIn && !process.server) {
        const [userError, user] = await safeAwait<UserI>($fetch('/api/session'));
        if(userError) { errorStore.error = 'There was an error getting the user\'s cart.'; return; }
        this.cart = user.cart || emptyCart;
      } else {
        if(!cookie.value) {
          this.cart = emptyCart;
        } else {
          //@ts-expect-error It automatically deserializes the cart.
          this.cart = cookie.value;
        }
      }
    },
    async saveCartToStorage() {
      const authStore = useAuthStore();
      const cookie = useCookie('cart');
      this.cart.total = this.total;
      this.cart.cartQuantity = this.totalQuantity;
      if(authStore.isLoggedIn) {
        await $fetch('/api/user/cart', { method: 'put', body: { cart: this.cart } });
      } else {
        //@ts-expect-error It automatically serializes the cart.
        cookie.value = this.cart;
      }
    }
  }
});
