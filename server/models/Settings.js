import mongoose from 'mongoose';

const Setting = mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  subtype: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

export default mongoose.model('Setting', Setting);
