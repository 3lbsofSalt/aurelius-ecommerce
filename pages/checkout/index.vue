<script setup lang="ts">
const cartStore = useCartStore();

const { data: payOnPickupThreshold } = await useFetch('/api/setting/payOnPickupThreshold');
const { data: allowPayOnPickup } = await useFetch('/api/setting/allowPayOnPickup');

const shipping = ref('pickup');
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

function getShippingRates() {
  $fetch('/api/shipping/rates', {
    query: {
      weightInGrams: cartStore.totalWeightGrams,
      shippingAddress
    }
  });
}

function payOnPickup() {
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
  $fetch('/api/checkout/stripe', {
    method: 'post',
    body: {
      billingAddress,
      shippingAddress,
      cart: cartStore.cart
    }
  })
    .then((res) => { console.log(res); });
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
            </v-radio-group>
            <v-btn
              @click="getShippingRates"
            >Calculate Shipping Rates</v-btn>
          </template>





          <template v-slot:item.3>
            <v-form>
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
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="billingAddress.street1"
                  variant="outlined"
                  label="Street Line 1"
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
                ></v-text-field>
                <v-text-field
                  class="ml-4"
                  v-model="billingAddress.state"
                  variant="outlined"
                  label="State"
                ></v-text-field>
                <v-text-field
                  class="mx-4"
                  v-model="billingAddress.postalcode"
                  variant="outlined"
                  label="Zip Code"
                ></v-text-field>
                <v-text-field
                  v-model="billingAddress.country"
                  variant="outlined"
                  label="Country (e.g. US)"
                ></v-text-field>
              </v-row>
            </v-form>
            <v-btn
              :disabled="!allowPayOnPickup && shipping === 'pickup'"
              color="primary"
              block
              rounded="0"
              variant="outlined"
              @click="payOnPickup"
            >Pay On Pickup</v-btn>
            <v-btn
              :disabled="!allowPayOnPickup && shipping === 'pickup'"
              color="primary"
              block
              rounded="0"
              variant="outlined"
              @click="payWithStripe"
            >Pay With Stripe</v-btn>
          </template>
        </v-stepper>
      </v-card>
    </v-row>
  </v-container>
</template>
