import { Schema, model } from 'mongoose';

export interface TagI {
  _id: string,
  name: string,
  active: boolean
}

const Tag = new Schema<TagI>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  }
});

export default model<TagI>('Tag', Tag);
