import { Schema, model } from 'mongoose';

export interface PrivilegeI {
  group: string
}

const Privileges = new Schema<PrivilegeI>({
  group: {
    type: String,
    required: true,
    unique: true
  }
});

export default model<PrivilegeI>('Privileges', Privileges);
