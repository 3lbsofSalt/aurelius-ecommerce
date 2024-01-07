import mongoose, { Schema, model } from 'mongoose';
import Cart from './subdocuments/Cart';
import type { CartI } from './subdocuments/Cart';
import safeAwait from 'safe-await';
import counter from './idCounter';

export const orderStatuses = ['Payment', 'Processing', 'Approved', 'Finished'];
export const paymentStatuses = ['Pending', 'Paid'];
export const paymentTypes = ['Stripe', 'On Pickup'];

export interface AddressI {
  fullname: string,
  company: string,
  street1: string,
  street2: string,
  street3: string,
  city: string,
  state: string,
  postalcode: string,
  country: string,
  phone: string,
  // Only necessary for shipping (don't even need it now that we have easypost)
  residential?: boolean 
}

export const emptyAddress: AddressI = {
  fullname: '',
  company: '',
  street1: '',
  street2: '',
  street3: '',
  city: '',
  state: '',
  postalcode: '',
  country: '',
  phone: '',
  residential: true 
};

export interface OrderIUnpopulated {
  _id: Number,
  name: String,
  customer?: number,
  customerContactInfo?: {
    email: string,
    phone: string
  },
  dateCreated?: Date,
  dateUpdated?: Date,
  cart: CartI,
  paymentType: 'Stripe' | 'On Pickup',
  paymentStatus: 'Pending' | 'Paid',
  transactionId?: string,
  orderStatus: 'Processing' | 'Approved' | 'Finished'
  billingAddress: AddressI,
  shippingType: 'Pickup' | 'Shipping',
  shipping?: {
    address: AddressI,
    packedBoxes: PackedBox,
    selectedRates: string[]
  },
  salesTax?: number
}

export interface OrderI {
  _id: Number,
  name: String,
  customer?: number,
  customerContactInfo?: {
    email: string,
    phone: string
  },
  dateCreated?: Date,
  dateUpdated?: Date,
  cart: CartI,
  paymentType: 'Stripe' | 'On Pickup',
  paymentStatus: 'Pending' | 'Paid',
  transactionId?: string,
  orderStatus: 'Processing' | 'Approved' | 'Finished'
  billingAddress: AddressI,
  shippingType: 'Pickup' | 'Shipping',
  shipping?: {
    address: AddressI
    packedBoxes: PackedBox,
    selectedRates: string[]
  },
  salesTax?: number
}

const Order = new Schema<OrderIUnpopulated>({
  // Need Tax -> Move to cart?
  _id: Number,
  name: String,
  customer: {
    type: Schema.Types.ObjectId,
    refs: 'User'
  },
  customerContactInfo: { 
    phone: String,
    email: String
  },
  cart: Cart,
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
    default: 'Processing',
    enum: orderStatuses
  },
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
  shippingType: String,
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
    packedBoxes: [{
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      },
      items: {
        type: Map,
        of: Number
      },
      weightInGrams: Number
    }],
    selectedRates: [{type: String}]
  },
  salesTax: Number
}, {
  timestamps: true
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

let exportModel = mongoose.models?.Order;
if(!exportModel) {
  exportModel = model<OrderI>('Order', Order);
}
export default exportModel;
