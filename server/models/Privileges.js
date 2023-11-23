import mongoose from 'mongoose';

const Privileges = mongoose.Schema({
  group: {
    type: String,
    required: true,
    unique: true
  }
});

export default mongoose.model('Privileges', Privileges);
