import { Schema, model } from 'mongoose';

export interface NavigationCategoryI {
  main: {
    _id: string,
    name: string
  },
}

const NavigationCategory = new Schema({
  main: {
    _id: {
      type: Schema.Types.ObjectId,
      refs: 'Tag'
    },
    name: {
      type: String,
      required: true
    }
  },
});

export default model('NavigationCategory', NavigationCategory);
