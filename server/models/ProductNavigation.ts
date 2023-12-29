import { Schema, model } from 'mongoose';
import { Tag, type TagI } from './Tag';

export interface NavigationCategoryI {
  _id: string,
  main: TagI,
  subcategories?: TagI[]
} 

export interface UnpopulatedNavigationCategoryI {
  _id: string,
  main: Schema.Types.ObjectId,
  subcategories?: Schema.Types.ObjectId
} 

const NavigationCategory = new Schema<UnpopulatedNavigationCategoryI>({
  main: {
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  },
  subcategories: [{ type: Schema.Types.ObjectId, ref: 'Tag' }]

});

export default model<UnpopulatedNavigationCategoryI>('NavigationCategory', NavigationCategory);
