<script setup lang="ts">
import type { IShipping, IRate } from '@easypost/api';
import type { SettingI } from '~/server/models/Setting';
const cartStore = useCartStore();
import type { PackedBox } from '~/server/utils/binPacking';

const { data: payOnPickupThreshold } = await useFetch<string>('/api/setting/payOnPickupThreshold');
const { data: salesTax } = await useFetch<SettingI>('/api/setting/salesTax');
const actualSalesTax: number = parseFloat(salesTax.value?.toString() || '0');
const { data: allowPayOnPickup } = await useFetch<boolean>('/api/setting/allowPayOnPickup');
console.log(payOnPickupThreshold.value);

const payOnPickupThresholdNum = computed(() => {
  return parseFloat(payOnPickupThreshold.value ?? '0').toFixed(2);
})

const payOnPickupDisabled = computed(() => {
  return parseFloat(payOnPickupThreshold.value ?? '0') < cartStore.total;
});

const billingAddressForm = ref(false);

const shipping = ref<'pickup' | IRate[]>('pickup');
const shippingAddress = reactive({
  fullname: '',
  company: '',
  street1: '',
  street2: '',
  street3: '',
  city: '',
  state: 'UT',
  postalcode: '',
  country: 'US',
  phonenumber: ''
});

const billingAddress = reactive({
  fullname: '',
  phonenumber: '',
  email: '',
  company: '',
  street1: '',
  street2: '',
  street3: '',
  city: '',
  state: 'UT',
  postalcode: '',
  country: 'US',
})

const gettingShippingRates = ref(false);

// Please note that both of these are corresponding on index
const shippingObject = ref<IShipping[]>([]);
const packedBoxes = ref<PackedBox[]>([]);
function getShippingRates() {
  if(gettingShippingRates.value) return;
  gettingShippingRates.value = true;
  $fetch('/api/shipping/rates', {
    query: {
      weightInGrams: cartStore.totalWeightGrams,
      shippingAddress: shippingAddress,
      cart: cartStore.cart
    }
  })
    .then((res: (PackedBox[]| IShipping[])[]) => {
      shippingObject.value = res[1];
    })
    .finally(() => {
      gettingShippingRates.value = false;
    });
}

const carriers = computed(() : string[] => {
  const carrierArr: string[] = []
  for(const shipping of shippingObject.value) {
    shipping.rates.map((rate: IRate) => { if(!carrierArr.includes(rate.carrier)) carrierArr.push(rate.carrier);  });
  }
  return carrierArr;
});

// Find the lowest rate for each carrier
const shippingRates = computed(() => {
  const rates: IRate[][] = [];
  for(const carrier of carriers.value) {
    const lowestCarrierRateForItem: IRate[] = [];
    for(const itemShipping of shippingObject.value) {
      lowestCarrierRateForItem.push(itemShipping.rates.reduce((accumulator: IRate | null, rate: IRate) => {
        if((accumulator === null || parseFloat(rate.rate) < parseFloat(accumulator.rate)) && rate.carrier === carrier) {
          return rate;
        }
        return accumulator;
      }, null));
    }
    rates.push(lowestCarrierRateForItem);
  }

  return rates;
});

interface compiledRate {
  rate: number,
  deliveryDays: (number | null)[],
  carrier: string
}

function getRatesInfo(rates: IRate[]) {
  const info: compiledRate = {
    rate: 0,
    deliveryDays: [],
    carrier: rates[0].carrier
  };

  for(const rate of rates) {
    info.rate += parseFloat(rate.rate);
    info.deliveryDays.push(rate.delivery_days);
  }

  return info;
}

function payOnPickup() {
  if(billingAddressForm.value !== true) return;
  $fetch('/api/checkout/payOnPickup', {
    method: 'post',
    body: {
      billingAddress,
      shippingAddress,
      cart: cartStore.cart
    }
  })
    .then((res) => {
      navigateTo('/checkout/success')
    });
}

function payWithStripe() {
  if(billingAddressForm.value !== true) return;
  $fetch('/api/checkout/stripe', {
    method: 'post',
    body: {
      billingAddress,
      shippingAddress,
      cart: cartStore.cart,
      shipping: {
        packedBoxes,
        shippingObjectIds: shippingObject.value.map((obj: IShipping) => obj.id),
        selectedShipping: shipping.value === 'pickup' ? 'pickup' : shipping.value.map((shiprate) => shiprate.id)
      }
    }
  })
    .then((res) => { 
      navigateTo(res, { external: true });
    })
    .catch((err) => {
      console.log(err);
    });
}
</script>
<template>
  <v-container
    fluid
    class="pa-8"
  >
    <v-row
      justify="start"
    >
      <v-btn
        prepend-icon="fas fa-arrow-left"
        class="ma-4"
        to="/cart"
        variant="outlined"
        flat
        rounded="0"
      >Back to Cart</v-btn>
    </v-row>
    <v-row>
    </v-row>
    <v-row>
      <v-card
        class="w-100"
      >
        <v-stepper
          :items="['Review Cart', 'Select Shipping', 'Payment']"
        >
          <template v-slot:item.1>
            <v-row
              class="pa-4"
            >
              <div class="text-h4">Please Review Your Order</div>
            </v-row>
            <v-card
              no-gutters
              v-for="item in cartStore.cart.items"
              class="text-primary mt-2"
              rounded="0"
              flat
            > 
              <v-row>
                <v-col 
                  cols="3"
                  class="ma-3"
                >
                  <v-img
                    cover
                    aspect-ratio="1"
                    :src="baseImageUrl(item.item.baseImagePath || '', item.item.images[0])"
                  ></v-img>
                </v-col>
                <v-col>
                  <v-row
                    class="mt-2"
                  >
                    <v-col>
                      <v-btn
                        class="text-h5 font-weight-bold"
                        variant="text"
                        :to="'/item/' + item.item._id"
                      >
                        {{item.item.name}}
                      </v-btn>
                    </v-col>
                    <v-spacer />
                    <v-col>
                      <div
                        class="text-h5 font-weight-bold sans-serif"
                      >{{'$' + item.item.price.toFixed(2)}}</div>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      <div class="sans-serif">{{item.item.description}}</div>
                    </v-col>
                  </v-row>

                  <v-row
                    class="mr-4"
                  >
                    <v-text-field 
                      variant="outlined"
                      hide-details="auto"
                      density="compact"
                      :model-value="item.quantity"
                      rounded="0"
                      class="mr-2"
                      label="Quantity"
                      readonly
                    />
                  </v-row>

                  <v-row
                    v-if="(item.item.customerInputFields?.length || 0) > 0"
                    v-for="fieldAnswer, i in item.fieldAnswers"
                    justify="start"
                    class="px-12"
                  >
                    <v-col
                      class="pa-0 mb-2"
                    >
                      <div
                        class="text-h6 font-weight-bold d-inline"
                      >{{item.item.customerInputFields?.[i].name}}: </div>
                      <div
                        class="text-h6 ml-4 d-inline"
                        v-if="item.item.customerInputFields?.[i].type === 'text'"
                      >{{ fieldAnswer }}</div>
                      <v-img
                        width="100"
                        max-height="400"
                        class="d-block mb-2 ml-4"
                        v-else-if="item.item.customerInputFields?.[i].type === 'download'"
                        :src="fromFullImagePath(fieldAnswer || '')"
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider
                color="primary"
                class="border-opacity-100"
              ></v-divider>
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-form>
              <v-row
                class="pa-4"
              >
                <div
                  class="text-primary text-h5"
                >Shipping Address</div>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="shippingAddress.fullname"
                  class="mr-4"
                  variant="outlined"
                  label="Name"
                ></v-text-field>
                <v-text-field
                  v-model="shippingAddress.company"
                  variant="outlined"
                  label="Company (Only Fill if Shipping to your Business Location)"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="shippingAddress.street1"
                  variant="outlined"
                  label="Street Line 1"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="shippingAddress.street2"
                  variant="outlined"
                  label="Street Line 2"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="shippingAddress.city"
                  variant="outlined"
                  label="City"
                ></v-text-field>
                <v-text-field
                  class="ml-4"
                  v-model="shippingAddress.state"
                  variant="outlined"
                  label="State"
                ></v-text-field>
                <v-text-field
                  class="mx-4"
                  v-model="shippingAddress.postalcode"
                  variant="outlined"
                  label="Zip Code"
                ></v-text-field>
                <v-text-field
                  v-model="shippingAddress.country"
                  variant="outlined"
                  label="Country (e.g. US)"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="shippingAddress.phonenumber"
                  variant="outlined"
                  label="Phone Number"
                ></v-text-field>
              </v-row>
            </v-form>
            <v-row
              class="pa-4"
            >
              <div
                class="text-primary text-h5"
              >
                Shipping Options
              </div>
            </v-row>
            <v-radio-group
              v-model="shipping"
            >
              <v-radio label="Pickup In Store" value="pickup"></v-radio>
              <v-radio 
                v-for="rateCombo in shippingRates"
                :label="getRatesInfo(rateCombo).carrier + ' - $' + (getRatesInfo(rateCombo).rate).toFixed(2)"
                :value="rateCombo"
              ></v-radio>
            </v-radio-group>
            <v-btn
              @click="getShippingRates"
              :loading="gettingShippingRates"
              variant="outlined"
              rounded="0"
              block
            >Calculate Shipping Rates</v-btn>
          </template>





          <template v-slot:item.3>
            <v-form 
              v-model="billingAddressForm"
              @submit.prevent
            >
              <v-row
                class="pa-4"
              >
                <div
                  class="text-primary text-h5"
                >Billing Address</div>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="billingAddress.fullname"
                  class="mr-4"
                  variant="outlined"
                  label="Name"
                  :rules="requiredRules"
                ></v-text-field>
                <v-text-field
                  v-model="billingAddress.company"
                  variant="outlined"
                  label="Company (Only Fill if Shipping to your Business Location)"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="billingAddress.phonenumber"
                  variant="outlined"
                  label="Phone Number"
                  :rules="[
                    (v) => !!v || 'This field is required',
                    ...phoneNumberRules]"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="billingAddress.street1"
                  variant="outlined"
                  label="Street Line 1"                  required
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="billingAddress.street2"
                  variant="outlined"
                  label="Street Line 2"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="billingAddress.city"
                  variant="outlined"
                  label="City"
                  :rules="requiredRules"
                ></v-text-field>
                <v-text-field
                  class="ml-4"
                  v-model="billingAddress.state"
                  variant="outlined"
                  label="State"
                  :rules="requiredRules"
                ></v-text-field>
                <v-text-field
                  class="mx-4"
                  v-model="billingAddress.postalcode"
                  variant="outlined"
                  label="Zip Code"
                  :rules="requiredRules"
                ></v-text-field>
                <v-text-field
                  v-model="billingAddress.country"
                  variant="outlined"
                  label="Country (e.g. US)"
                  :rules="requiredRules"
                ></v-text-field>
              </v-row>
              <v-row>
                <v-col>
                  Subtotal: ${{ cartStore.total.toFixed(2) }}
                  Sales Tax: ${{ (Math.round(cartStore.total * actualSalesTax * 100) / 100).toFixed(2) }}
                  Shipping: ${{ shipping === 'pickup' ? 'Pick Up In Store ($0.00)' : roundToNextCent(getRatesInfo(shipping).rate).toFixed(2) }}
                  Total: ${{ cartStore.total + (Math.round(cartStore.total * actualSalesTax * 100) / 100) + (shipping === 'pickup' ? 0 : getRatesInfo(shipping).rate) }}
                </v-col>
              </v-row>
              <v-row
                no-gutters
              >
                <v-col>
                  <v-btn
                    v-if="allowPayOnPickup && shipping === 'pickup'"
                    type="submit"
                    color="primary"
                    block
                    rounded="0"
                    variant="outlined"
                    @click="payOnPickup"
                    :disabled="payOnPickupDisabled"
                  >Pay On Pickup</v-btn>
                </v-col>
              </v-row>
              <v-row
                v-if="payOnPickupDisabled && allowPayOnPickup"
                no-gutters
              >
                <v-col>
                  <div
                    class="text-caption"
                  >Pay on pickup is not allowed for orders over {{ payOnPickupThresholdNum }}</div>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="mt-2"
              >
                <v-col>
                  <v-btn
                    color="primary"
                    type="submit"
                    block
                    rounded="0"
                    variant="outlined"
                    @click="payWithStripe"
                  >Pay With Stripe</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </template>
        </v-stepper>
      </v-card>
    </v-row>
  </v-container>
</template>
