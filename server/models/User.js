import mongoose from 'mongoose';
import Cart from './subdocuments/Cart.js';
import safeAwait from 'safe-await';

// Auto Increment Functionality
 /*
import MonSeq from 'mongoose-sequence';
const AutoIncrement = MonSeq(mongoose);
*/

const User = mongoose.Schema({
//  _id: Number,
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
    type: String, 
    required: true 
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
      throw new Error(error);
      return;
    }

    await this.save();

    return this.cart;
  }
}

export default mongoose.model('User', User);
