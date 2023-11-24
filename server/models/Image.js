import mongoose from 'mongoose';

const Image = mongoose.Schema({
  location: {
    type: String,
    required: true
  },

  altText: {
    type: String
  }
});

export default mongoose.model('Image', Image);
