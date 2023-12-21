import mongoose, { Schema, model } from 'mongoose';

export interface SettingI {
  type: string,
  subtype: string,
  name: string,
  value: any
}

const Setting = new Schema<SettingI>({
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
    type: Schema.Types.Mixed,
  }
});

export default model<SettingI>('Setting', Setting);
