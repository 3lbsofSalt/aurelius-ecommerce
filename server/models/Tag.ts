import { Schema, model } from 'mongoose';

export interface TagI {
  _id: string,
  name: string,
  active: boolean,
  imageLocation?: string
}

export const Tag = new Schema<TagI>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  imageLocation: String
});

export default model<TagI>('Tag', Tag);
