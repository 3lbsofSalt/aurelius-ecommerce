import { defineMongooseModel } from '#nuxt/mongoose';

export const ImageSchema = defineMongooseModel('Image', {
  location: {
    type: String,
    required: true
  },

  altText: {
    type: String
  }
});
