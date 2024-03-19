import type { DimensionsI } from "~/server/models/InventoryItem";
import type { CartItemI } from "~/server/models/subdocuments/Cart";
import Setting from "~/server/models/Setting";
import safeAwait from "safe-await";

export const packInBins = async (itemsRef: CartItemI[]) => {
  let [binsError, binsSetting] = await safeAwait(Setting.findOne({
    type: 'shipping',
    subtype: 'config',
    name: 'bins'
  }));

  if(binsError || !binsSetting?.value || !((binsSetting?.value?.length || []) > 0)) {
    console.error(binsError);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bins are not configured correctly or there was a server error.'
    });
  }

  const availableBins = [...(binsSetting?.value as DimensionsI[] || [])];
  availableBins.sort((a, b) => {
    const bVol = b.height * b.length * b.width;
    const aVol = a.height * a.length * a.width;
    return aVol - bVol;
  }).reverse();
  const items = [...itemsRef];

  const packedBins: PackedBox[] = [];
  while(items.findIndex(item => item.item.shipIndividually) !== -1) {
    const itemIndex = items.findIndex(item => item.item.shipIndividually);
    const item = items[itemIndex];
    console.log(item.item);
    for(let i = 0; i < item.quantity; i++) {
      if(!item.item.individualPackageDimensions) {
        throw new Error('One of the individually packaged items did not have dimensions for its package');
      }

      const map = new Map();
      map.set(item.item._id, 1);

      console.log(map);
      packedBins.push({
        dimensions: item.item.individualPackageDimensions,
        items: map,
        weightInGrams: convertWeightsToGrams([item.item.weight])
      });
    }

    items.splice(itemIndex, 1);
  }

  items.sort((a, b) => {
    const aBig = Math.max(a.item.dimensions.length, a.item.dimensions.height, a.item.dimensions.width);
    const bBig = Math.max(b.item.dimensions.length, b.item.dimensions.height, b.item.dimensions.width);
    return aBig - bBig;
  }).reverse();

  if(items.some(item => !availableBins.some(bin => fitsInBin(item.item.dimensions, bin)))) {
    throw new Error('There is not a single bin that will fit this item');
  }

  // This keeps track of the number of items left to pack
  const itemsQty = items.map(item => item.quantity); 

  // Pack the bins!
  while(!itemsQty.every((qty) => qty <= 0)) {
    // Pack a new box every time the loop executes
    const currentBox = packBin(items, availableBins[0], itemsQty);
    packedBins.push(currentBox);
  }

  // Here I attempt to pack the boxes in smaller boxes to save shipping
  for(const binIndex in packedBins) {
    const bin = packedBins[binIndex];
    const binItems: CartItemI[] = [];
    // Recreate the bin
    for(const key of bin.items.keys()) {
      // Use itemsRef here because it hasn't been modified
      // Also, it doesn't matter where we get this item as long as it is the one associated with the necessary id
      const cartItem = itemsRef.find(item => item.item._id === key); 
      if(cartItem) {
        binItems.push({
          item: cartItem.item,
          quantity: bin.items.get(key) || 0,
          fieldAnswers: []
        });
      }
    }
    if(binItems.some(cartItem => cartItem?.item.shipIndividually)) continue;

    while(true) {
      const binSize = packedBins[binIndex].dimensions;
      const newBinIndex = availableBins.findIndex(abin => 
        binSize.width === abin.width && 
          binSize.height === abin.height &&
          binSize.length === abin.length
      );

      const tmpItemsQty = binItems.map(binItem => binItem.quantity);
      if(newBinIndex + 1 >= availableBins.length) break; // Already the smallest box possible
      const newBin = availableBins[newBinIndex + 1];
      const packedSmallerBin = packBin(binItems, newBin, tmpItemsQty);
      if(!tmpItemsQty.every(qty => qty === 0)) {
        break;
      }

      packedBins[binIndex] = packedSmallerBin;
    }
  }

  // Remember this is a greedy algorithm
  // Remember that the most important thing is not to cost nikki more money than we charge the customer.
  return packedBins;
}

/*
 * itemSet and itemTracker should have items that correspond the the same index
 * itemTracker should be an array of positive numbers representing the number of
 * unpacked items in each index of itemSet
 * binToPack is the dimensions of the bin being packed
 */
const packBin = (itemSet: CartItemI[], binToPack: DimensionsI, itemTracker: number[]): PackedBox => {

  const currentBox : PackedBox = {
    dimensions: binToPack,
    items: new Map<number, number>(),
    weightInGrams: 0
  }

  const openSpots : DimensionsI[] = [
    currentBox.dimensions
  ];

  for(const itemIndex in itemSet) {
    const item = itemSet[itemIndex];
    // While there is a spot large enough to fit the item I'm currently looking at
    // And there are any items that still need to be packed
    while(openSpots.some(spot => fitsInBin(item.item.dimensions, spot)) && itemTracker[itemIndex] > 0) {
      openSpots.sort((a, b) => {
        return a.length * a.width * a.height - b.length * b.width * b.height;
      }).reverse(); // Sort from largest to smallest

      // Add the item to the box
      const smallestSpotThatFitsIndex = openSpots.findLastIndex(spot => fitsInBin(item.item.dimensions, spot));
      const itemQty : number = currentBox.items.get(item.item._id) || 0;
      currentBox.items.set(item.item._id, itemQty + 1); 
      currentBox.weightInGrams += convertWeightsToGrams([item.item.weight]);
      itemTracker[itemIndex]--;

      if(itemTracker[itemIndex] < 0) throw new Error('There was an error with the bin tracker');

      // Slice the box
      const smallestSpotThatFits = openSpots[smallestSpotThatFitsIndex];
      openSpots.splice(smallestSpotThatFitsIndex, 1);
      openSpots.push(...sliceBox(smallestSpotThatFits, item.item.dimensions));
    }
  }

  return currentBox;
}

export const fitsInBin = (item: DimensionsI, bin : DimensionsI) => {
  const itemDims = [item.length, item.height, item.width];
  const binDims = [bin.length, bin.height, bin.width];

  itemDims.sort((a, b) => a - b);
  binDims.sort((a, b) => a - b);

  return itemDims[0] <= binDims[0] &&
    itemDims[1] <= binDims[1] &&
    itemDims[2] <= binDims[2]
};

const sliceBox = (spotDims: DimensionsI, itemDims: DimensionsI) => {
  const newSpots = [];
  const spotDimsInOrder = [spotDims.width, spotDims.length, spotDims.height].sort((a, b) => a - b);
  const itemDimsInOrder = [itemDims.width, itemDims.length, itemDims.height].sort((a, b) => a - b);

  // TODO: There is an optimization available here regarding selecting the orientation of the box.
  // TODO: Select the first cut based on which resulting box has the most volume after the cut
  // Note that these are both bug-prone and will require some rigorous proving
  if(spotDimsInOrder[2] - itemDimsInOrder[2] > 0) {
    newSpots.push({
      height: spotDimsInOrder[0],
      length: spotDimsInOrder[1],
      width: spotDimsInOrder[2] - itemDimsInOrder[2]
    }); // First cut
  }

  if(spotDimsInOrder[1] - itemDimsInOrder[1] > 0) {
    newSpots.push({
      height: spotDimsInOrder[0],
      length: spotDimsInOrder[1] - itemDimsInOrder[1],
      width: itemDimsInOrder[2]
    });
  }

  if(spotDimsInOrder[0] - itemDimsInOrder[0] > 0) {
    newSpots.push({
      height: spotDimsInOrder[0] - itemDimsInOrder[0],
      length: itemDimsInOrder[1],
      width: itemDimsInOrder[2]
    });
  }

  return newSpots;
}

// The key in the map is an object id for an inventory item, while the value is the quantity of that item.
export interface PackedBox {
  dimensions: DimensionsI;
  items: Map<number, number>,
  weightInGrams: number
}
