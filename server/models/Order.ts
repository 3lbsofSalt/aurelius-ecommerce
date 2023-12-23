import { Schema, model } from 'mongoose';
import Cart from './subdocuments/Cart';
import type { CartI } from './subdocuments/Cart';
import counter from './idCounter';
import safeAwait from 'safe-await';

export const orderStatuses = ['Awaiting Payment', 'Processing', 'Approved', 'Finished'];
export const paymentStatuses = ['Pending', 'Paid'];
export const paymentTypes = ['Stripe', 'On Pickup'];

export interface OrderI {
  _id: Number,
  name: String,
  customer?: number,
  dateCreated?: Date,
  dateUpdated?: Date,
  cart: CartI,
  /*
  paymentType: 'Stripe' | 'On Pickup',
  paymentStatus: 'Pending' | 'Paid',
  transactionId?: string,
  orderStatus: 'Awaiting Payment' | 'Processing' | 'Approved' | 'Finished'
  */
}

const Order = new Schema({
  // Need Tax -> Move to cart?
  _id: Number,
  name: String,
  customer: {
    type: Schema.Types.ObjectId,
    refs: 'User'
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  dateUpdated: {
    type: Date,
    default: Date.now
  },
  cart: Cart,
  /*
  paymentType: {
    type: String,
    required: true,
    enum: paymentTypes
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
    enum: paymentStatuses
  },
  transactionId: String,

  orderStatus: {
    type: String,
    default: 'Awaiting Payment',
    enum: orderStatuses
  },


  /*
  billingAddress: {
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
  },

  shipping: {
    address: {
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
    },
    shipstationObj: {
      serviceName: String,
      serviceCode: String, 
      shipmentCost: Number,
      otherCost: Number
    }
  }
  */

});

Order.pre('save', async function(next) {
  const doc = this;
  if(!doc.isNew) next();
  const [error, nextId] = await safeAwait(counter.findByIdAndUpdate({_id: 'order_id'}, {$inc: {seq: 1}, new: true }));
  if(error) throw error;
  if(nextId == null) {
    const seq = await counter.create({_id: 'order_id', seq: 1});
    doc._id = seq.seq;
  } else {
    doc._id = nextId.seq;
  }
  next();

});


export default model('Order', Order);
