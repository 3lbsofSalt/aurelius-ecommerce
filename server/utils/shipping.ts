import safeAwait from "safe-await";
import Setting from "~/server/models/Setting";
import type { WeightI } from "../models/InventoryItem";

export const getShipstationAPIKey = async () => {
  const [settingsError, settings] = await safeAwait(Setting.find({
    type: 'externalApps',
    subtype: 'shipping',
    name: ['shipStationAPIKey', 'shipStationAPISecret']
  }));

  if(settingsError) { throw settingsError; }
  const apiKey = settings.find(set => set.name === 'shipStationAPIKey');
  const apiSecret = settings.find(set => set.name === 'shipStationAPISecret');

  if(!apiKey || !apiSecret) { throw 'Shipstation is not set up.'; }

  const buf = Buffer.from(apiKey.value + ':' + apiSecret.value);
  return buf.toString('base64');
}

export const makeShipstationRequest = async () => {

}

export const convertWeightsToGrams = (weights: WeightI[]) : number => {
  let total = 0;
  for(const weight of weights) {
    if(weight.units === 'grams') {
      total += weight.quantity;
    } else if(weight.units === 'ounces') {
      total += (weight.quantity * 28.34952)
    } else if(weight.units === 'pounds'){
      total += (weight.quantity * 453.5924)
    }
  }

  return total;
}

export interface carrierType {
  name: string,
  code: string,
  accountNumber: any,
  requiresFundedAccount: boolean,
  balance: number,
  nickname: string,
  shippingProviderId: number,
  primary: boolean
}

export interface shippingAddressType {
  name: string,
  company: string,
  street1: string,
  street2: string,
  street3: string,
  state: string,
  city: string,
  zipcode: string,
  country: string,
  phonenumber: string,
}
