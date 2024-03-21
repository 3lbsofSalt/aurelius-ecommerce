import { Schema, model } from 'mongoose';
import Cart, { type CartI, emptyCart } from './subdocuments/Cart';
import safeAwait from 'safe-await';
import counter from './idCounter';

export interface UserI {
  _id?: string,
  id: number,
  email: string,
  name?: string,
  phone?: string,
  hash?: string,
  active?: boolean,
  activationToken?: string,
  resetToken?: string,
  permissionGroup?: string,
  cart?: CartI,
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
  id: {
    type: Number,
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
  cart: {
    type: Cart,
    default:null 
  },
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
    const [error] = await safeAwait(this.cart.refreshCart());

    if(error) {
      // @ts-ignore
      throw new Error(error);
    }

    await this.save();

    return this.cart;
  }
}

User.pre('save', async function(next) {
  const doc = this;
  if(!doc.isNew) next();
  const [error, nextId] = await safeAwait(counter.findByIdAndUpdate({_id: 'user_id'}, {$inc: {seq: 1}, new: true, upsert: true}));
  if(error) throw error;
  if(nextId == null) {
    const seq = await counter.create({_id: 'user_id', seq: 1});
    doc.id = seq.seq;
  } else {
    doc.id = nextId.seq;
  }

  //doc.cart = emptyCart;
  next();
});


export default model<UserI>('User', User);
