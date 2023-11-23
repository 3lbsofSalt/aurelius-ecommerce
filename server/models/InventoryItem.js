import mongoose from 'mongoose';

export const InventoryItem = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },

  tags: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      refs: 'Tag'
    },
    name: {
      type: String,
      required: true
    }
  }],

  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateModified: {
    type: Date,
    default: Date.now
  },
  timesSold: Number,
  // Adding any image name to the baseImagePath will point to their location in the filesystem
  // on the S3 bucket. This allows the baseImagePath to never change even between name
  // changes of the inventory item (the name of the item is appended with a randomly generated UUID)
  images: [{
    name: {
      type: String,
      required: true
    },
    altText: String
  }],
  baseImagePath: String,

  customerInputFields: [{
    type: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      required: true,
      default: true
    },
    description: { type: String },
    name: {
      type: String,
      required: true
    }
  }],

  weight: {
    units: {
      type: String,
      required: true,
      enum: ['pounds', 'ounces', 'grams'],
      default: 'pounds'
    },
    quantity: {
      type: Number,
      required: true,
      default: '1'
    },
  }
});

InventoryItem.methods = {
  getSafeImageUrl: function(imageIndex) {
    return process.env.DIGITAL_OCEAN_SPACES_BUCKET_URL_PREFIX + encodeURI(this.baseImagePath + this.images[imageIndex].name)
  }
};

export default mongoose.model('InventoryItem', InventoryItem);
