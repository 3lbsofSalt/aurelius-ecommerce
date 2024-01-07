import safeAwait from "safe-await";
import InventoryItem, { validWeightUnits, validInputTypes } from "~/server/models/InventoryItem";
import { useLogger } from "@nuxt/kit";

import { isAlphanumeric, isWideRangeAlphanumeric, isCurrency, isPositiveInteger, isPositiveNumber } from '~/utils/validationFunctions';
import formidable from 'formidable';
import { randomUUID } from 'crypto';
import { readFileSync } from 'node:fs';
import type { TagI } from "~/server/models/Tag";

export default defineEventHandler(async (event) => {
  // Check for route access
  const hasAccess = await hasRouteAccess(event, 'Inventory');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const form = formidable({});

  const [error, formData] = await safeAwait(form.parse(event.req));

  if(error) {
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
  const dimensions = JSON.parse(fields.dimensions[0]);
  const shipIndividually = JSON.parse(fields.shipIndividually[0]);
  const individualPackageDimensions = JSON.parse(fields.individualPackageDimensions[0]);

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
      statusMessage: 'The weight quantity or units was not provided'
    });
  }

  if(
    !isPositiveNumber(dimensions.length) || 
    !isPositiveNumber(dimensions.width) || 
    !isPositiveNumber(dimensions.height)
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The length width and height must all be positive numbers.'
    });
  }

  console.log(individualPackageDimensions);
  if(shipIndividually) {
    if(!individualPackageDimensions.length || individualPackageDimensions.length <= 0 ||
      !individualPackageDimensions.width || individualPackageDimensions.width <= 0 ||
      !individualPackageDimensions.height || individualPackageDimensions.height <= 0 
    ) {
      throw createError({
        statusCode: 422,
        statusMessage: 'If packaging individually, must provide a width, length, and height of preferred package'
      });
    }
  }

  // Check input fields. Name is required description is not
  if(inputFields.some((input:any) => 
      !validInputTypes.includes(input.type) || 
      !isWideRangeAlphanumeric(input.description) || 
      !input.name || 
      !isWideRangeAlphanumeric(input.name)
  )) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The inputs were ill-formed'
    });
  }

  const inventoryImageLocationPrefix = 'inventory_images/' + name + randomUUID() + '/';  

  const imagesUploading = [];
  const imageMetaData = [];
  for(const image in files.images) {
    const imageBuf = readFileSync(files.images[image].filepath);
    imagesUploading.push(
      uploadImage(inventoryImageLocationPrefix + imagesData[image].name, imageBuf)
    );
    imageMetaData.push({
      name: imagesData[image].name,
      altText: imagesData[image].altText
    });
  }

  const [uploadError] = await safeAwait(Promise.all(imagesUploading));

  if(uploadError) {
    logger.error(uploadError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error trying to upload the images for a new inventory item.'
    });
  }

  const [inventoryCreateError] = await safeAwait(InventoryItem.create({
    name,
    description,
    price,
    tags,
    weight,
    customerInputFields: inputFields,
    images: imageMetaData,
    baseImagePath: inventoryImageLocationPrefix,
    dimensions,
    shipIndividually,
    individualPackageDimensions: individualPackageDimensions
  }));

  if(inventoryCreateError) {
    logger.error(inventoryCreateError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating the inventory item'
    });
  }
});
