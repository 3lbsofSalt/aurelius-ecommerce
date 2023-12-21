import { Schema, model } from 'mongoose';
import type { TagI } from './Tag';
import safeAwait from 'safe-await';
import counter, { type counterI } from './idCounter';

export const validWeightUnits = ['pounds', 'ounces', 'grams'];

export interface WeightI {
  units: 'pounds' | 'ounces' | 'grams',
  quantity: number
}

export const validInputTypes = ['download', 'text'];

export interface CustomInputFieldsI {
  type: 'download' | 'text',
  required: boolean,
  description?: string,
  name: string
}

export interface InventoryImageI {
  _id?: string,
  name: string,
  altText: string
}

export interface InventoryItemI {
  _id: number,
  name: string,
  description?: string,
  price: number,
  tags: TagI[],
  dateAdded?: Date,
  dateModified?: Date,
  timesSold?: number,
  images: InventoryImageI[],
  baseImagePath?: string,
  customerInputFields?: CustomInputFieldsI[],
  weight?: WeightI,
  active?: boolean
}


export const InventoryItem = new Schema<InventoryItemI>({
  _id: {
    type: Number,
    unique: true
  },
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
      type: Schema.Types.ObjectId,
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
  },
  active: {
    type: Boolean,
    default: true
  }
});

InventoryItem.methods = {
  getSafeImageUrl: function(imageIndex: number) {
    return process.env.DIGITAL_OCEAN_SPACES_BUCKET_URL_PREFIX + encodeURI(this.baseImagePath + this.images[imageIndex].name)
  }
};


InventoryItem.pre('save', async function(next) {
  const doc = this;
  if(!doc.isNew) next();
  const [error, nextId] = await safeAwait(counter.findByIdAndUpdate({_id: 'inventory_item_id'}, {$inc: {seq: 1}, new: true, upsert: true}));
  if(error) throw error;
  if(nextId == null) {
    const seq = await counter.create({_id: 'inventory_item_id', seq: 0});
    doc._id = seq.seq;
  } else {
    doc._id = nextId.seq;
  }
  next();

});


export default model<InventoryItemI>('InventoryItem', InventoryItem);
