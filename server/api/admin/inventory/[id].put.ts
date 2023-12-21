import safeAwait from 'safe-await';
import InventoryItem from '~/server/models/InventoryItem';
import { useLogger } from '@nuxt/kit';
import { hasRouteAccess } from '~/server/utils/auth';
import { isAlphanumeric, isWideRangeAlphanumeric, isCurrency, isPositiveInteger } from '~/utils/validationFunctions';
import formidable from 'formidable';
import { randomUUID } from 'crypto';
import { readFileSync } from 'node:fs';
import type { TagI } from "~/server/models/Tag";
import { validInputTypes, validWeightUnits, type InventoryItemI } from '~/server/models/InventoryItem';
import { baseImageUrl } from '~/utils/imageRetrieval';
import { deleteImage } from '~/server/utils/fileUpload';


export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Inventory');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const id = getRouterParam(event, 'id');

  const logger = useLogger();
  // Allow Empty Files as any files that are send which are empty were already uploaded
  const form = formidable({ allowEmptyFiles: true, minFileSize: 0 });
  const [error, formData] = await safeAwait(form.parse(event.req));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error parsing the form data'
    });
  }

  const [fields, files] = formData as any;

  const name = fields.name[0];
  const description = fields.description[0];
  const price = fields.price[0];
  const tags : TagI[] = JSON.parse(fields.tags[0]).map((tag:any) => tag.value);
  const weightUnits = fields.weightUnits[0];
  const weightQty = fields.weightQty[0];
  const weight = { units: weightUnits, quantity: weightQty };
  const inputFields = JSON.parse(fields.inputFields[0]);
  const imagesData = fields.imagesData.map((data:any) => JSON.parse(data));
  const imagesToRemove = JSON.parse(fields.imagesToRemove[0]);

  if(
    !isAlphanumeric(name) || 
      !isWideRangeAlphanumeric(description) || 
      !isCurrency(price)
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The name, description, or price was ill-formed.'
    });
  }
  // Validations
  if(
    !isPositiveInteger(weightQty) || 
    !validWeightUnits.includes(weightUnits)
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The weight quatity or units or'
    });
  }

  if(inputFields.some((input:any) => !validInputTypes.includes(input.type) || !isAlphanumeric(input.description) || !isAlphanumeric(input.name))) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The inputs were ill-formed'
    });
  }

  const [itemError, item] = await safeAwait(InventoryItem.findOne({ _id: id }));
  if(itemError || !item) {
    logger.error(itemError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the data for this inventory item.'
    });
  }

  const inventoryImageLocationPrefix = item?.baseImagePath || '';

  const imagesUploading = [];
  const imageMetaData = [];
  for(const image in files.images) {
    imageMetaData.push({
      name: imagesData[image].name,
      altText: imagesData[image].altText
    });
    if(files.images[image].size <= 0) continue;
    const imageBuf = readFileSync(files.images[image].filepath);
    imagesUploading.push(
      uploadImage(inventoryImageLocationPrefix + imagesData[image].name, imageBuf)
    );
  }

  for(const image of (item.images || [])) {
    if(imagesToRemove.includes(image._id)) {
      deleteImage(baseImageUrl(inventoryImageLocationPrefix, image));
    }
  }

  const [uploadError] = await safeAwait(Promise.all(imagesUploading));

  if(uploadError) {
    logger.error(uploadError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error trying to upload the images for a new inventory item.'
    });
  }


  const [updateError] = await safeAwait(InventoryItem.updateOne({ _id: id }, {
    name,
    description,
    price,
    tags,
    weight,
    customerInputFields: inputFields,
    images: imageMetaData,
  }));

  if(updateError) {
    logger.error(updateError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating the inventory item'
    });
  }
});

