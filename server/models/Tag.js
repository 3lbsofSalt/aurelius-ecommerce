import mongoose from 'mongoose';

const Tag = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

export default mongoose.model('Tag', Tag);
