import { Schema, model } from 'mongoose';

export interface RoutePrivilegesI {
  name: string,
  groups: string[]
}

const RoutePrivileges = new Schema<RoutePrivilegesI>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  groups: {
    type: [String],
    default: []
  }
});

export default model<RoutePrivilegesI>('RoutePrivileges', RoutePrivileges);
