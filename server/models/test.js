const mongoose = require('mongoose');

const TestSchema = mongoose.Schema({
  message: { Type: String, required: true }
})

module.exports = mongoose.model('TestSchema', TestSchema);
