import mongoose from 'mongoose';

const RoutePrivileges = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  groups: {
    type: Array
  }
});

export default mongoose.model('RoutePrivileges', RoutePrivileges);
