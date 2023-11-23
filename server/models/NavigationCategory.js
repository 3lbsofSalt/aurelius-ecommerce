import mongoose from 'mongoose';

const NavigationCategory = mongoose.Schema({
  main: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      refs: 'Tag'
    },
    name: {
      type: String,
      required: true
    }
  },
  subgroups: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      refs: 'Tag'
    },
    name: {
      type: String,
      required: true
    }
  }],
  onTitleBar: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('NavigationCategory', NavigationCategory);
