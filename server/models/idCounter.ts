import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

export interface counterI {
  _id: string,
  seq: number
}

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

let exportModel = mongoose.models?.counter;
if(!exportModel) {
  exportModel = model('counter', CounterSchema); 
}
export default exportModel;
