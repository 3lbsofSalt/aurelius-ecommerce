import { type InventoryImageI } from '~/server/models/InventoryItem';
export const baseImageUrl = (baseImagePath: string, image: InventoryImageI) => {
  const config = useRuntimeConfig();
  const src = config.public.DIGITAL_OCEAN_SPACES_RETRIEVAL_ENDPOINT + 
    config.public.DIGITAL_OCEAN_SPACES_FILE_PREFIX +
    baseImagePath +
    image?.name; 
  return src;
}
