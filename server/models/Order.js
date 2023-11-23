import mongoose from 'mongoose';
import Cart from './subdocuments/Cart.js';

// Auto Increment Functionality
import MonSeq from 'mongoose-sequence';
const AutoIncrement = MonSeq(mongoose);

const orderStatuses = ['Awaiting Payment', 'Processing', 'Approved'];
const paymentStatuses = ['Pending', 'Paid'];
const paymentTypes = ['Stripe', 'PayPal', 'On Pickup'];

const Order = mongoose.Schema({
  // Need Billing Address
  // Need Shipping Information
  // Need Tax
  // Need Name
  _id: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
  total: Number,
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

});

Order.statics.orderStatuses = orderStatuses;
Order.statics.paymentStatuses = paymentStatuses;
Order.statics.paymentTypes = paymentTypes;

Order.plugin(AutoIncrement, { inc_field: '_id' });


export default mongoose.model('Order', Order);
