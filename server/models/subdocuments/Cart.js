import mongoose from 'mongoose';
import { InventoryItem } from '../InventoryItem.js';

import safeAwait from 'safe-await';

const Cart = mongoose.Schema({
  items: [{
    item: InventoryItem,
    // Fields are a 2-dimensional array as each item in the cart can have more than one field to fill out
    // and can have sets of fields with different values.
    // The first array contains sets of unique fields, the inner array contains individual fields
    fields: [{
      fieldSet: [{
        _id: mongoose.Schema.Types.ObjectId,
        description: String,
        name: String,
        required: Boolean,
        type: {
          type: String,
          enum: ['download', 'text']
        },
        value: String,
        default: []
      }],
      quantity: {
        type: Number,
        default: 0
      },
    }],
    quantity: Number
  }],
  quantity: Number,
  total: {
    type: Number
  }
});

Cart.statics = {
  // Try to use this only if refreshCart has already been called on the cart object in the function
  getTotalWeight: function(cart) {
    // Convert all weight to ounces
    let weight = 0;
    for(const item of cart.items) {
      let toAdd = 0;
      switch(item.item.weight.units) {
        case 'pounds':
          toAdd = item.item.weight.quantity * 16;
          break;
        case 'ounces':
          toAdd = item.item.weight.quantity;
          break;
        case 'grams': 
          toAdd = item.item.weight.quantity * 0.03527396;
          break;
        default:
          throw new Error('There was a big problem. The unit names were wrong.');
      }

      toAdd *= item.quantity;
      weight += toAdd;
    }

    return {
      quantity: weight,
      units: 'ounces'
    };
  }
}

Cart.methods = {
  refreshCart: async function() {
    this.items = this.items.filter(item => !!item?.item?._id);
    const items = this.items;
    const inventoryItemProms = [];

    for (const item in items) {
      inventoryItemProms.push(mongoose.model('InventoryItem').findOne({_id: items[item].item._id}));
      this.items[item].fields = this.items[item].fields.filter((fields) => {
        return fields?.quantity && (typeof fields.quantity) === 'number' && fields?.fieldSet?.length > 0;
      });
    }

    // Update the items in the
    const [error, itemResults] = await safeAwait(Promise.all(inventoryItemProms));
    if(error) {
      throw new Error(error);
    }

    const indexesToSlice = [];
    for(const itemIndex in itemResults) {
      const item = itemResults[itemIndex];
      if(item === null) {
        indexesToSlice.push[itemIndex];
        continue;
      }

      this.items[itemIndex].item = item;
    }

    // Go through them backwards so that the array index locations don't get messed up after removal
    for (const index = indexesToSlice.length - 1; index >= 0; i--) {
      this.items.splice(indexesToRemove[index], 1);
      this.items.splice(indexesToRemove[index], 1);
    }

    this.updateTotals();
    return this;

  },

  updateTotals: function() {
    this.items = this.items.filter(item => item?.item?.price);

    // This ensures every quantity is correct
    this.quantity = this.items.reduce((quantity, itemGroup, i) => {
      if(itemGroup.fields.length > 0) {
        const updatedQty = itemGroup.fields.reduce((fieldQuantity, field) => {
          return fieldQuantity + field.quantity;
        }, 0);
        this.items[i].quantity = updatedQty;
        return quantity + this.items[i].quantity;
      } else {
        return quantity + itemGroup.quantity;
      }
    }, 0);

    // This ensures the total is correct
    this.total = this.items.reduce((total, item, i) => {
      return total + (item.item.price * item.quantity);
    }, 0);

    return this;
  }

};


export default Cart;

mongoose.model('Cart', Cart);
