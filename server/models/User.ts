import { Schema, model } from 'mongoose';
import Cart from './subdocuments/Cart.js';
import safeAwait from 'safe-await';
import counter, { type counterI } from './idCounter';

// Auto Increment Functionality
 /*
import MonSeq from 'mongoose-sequence';
const AutoIncrement = MonSeq(mongoose);
*/

export interface UserI {
  _id: number,
  email: string,
  name?: string,
  phone?: string,
  hash?: string,
  active?: boolean,
  activationToken?: string,
  resetToken?: string,
  permissionGroup?: string,
  cart?: any,
  shippingAddress?: {
    fullname?: string,
    company?: string,
    street1?: string,
    street2?: string,
    street3?: string,
    city?: string,
    state?: string,
    postalCode?: string,
    country?: string,
    phone?: string,
    residential?: boolean
  }
}

const User = new Schema<UserI>({
  _id: {
    type: Number,
    required: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name:  {
    type: String
  },
  phone: {
    type: String
  },
  hash: { 
    type: String
  },
  active: {
    type: Boolean 
  },
  activationToken: {
    type: String
  },
  resetToken: {
    type: String
  },
  permissionGroup: {
    type: String,
    default: 'Basic'
  },
  cart: Cart,
  shippingAddress: {
    fullname: String,
    company: String,
    street1: String,
    street2: String,
    street3: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
    residential: Boolean
  }
});

User.methods = {
  refreshCart: async function() {
    const [error, result] = await safeAwait(this.cart.refreshCart());

    if(error) {
      // @ts-ignore
      throw new Error(error);
    }

    await this.save();

    return this.cart;
  }
}

User.pre('save', function(next) {
  const doc = this;
  if(!doc.isNew) next();
  counter.findByIdAndUpdate({_id: 'user_id'}, {$inc: {seq: 1}, upsert: true}, function(error : any, nextId: counterI) {
    if(error) throw error;
    doc._id = nextId.seq;
    next();
  });
});

export default model<UserI>('User', User);
