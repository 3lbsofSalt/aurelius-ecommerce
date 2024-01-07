<script setup lang="ts">
import type { DimensionsI } from '~/server/models/InventoryItem';
import type { SettingI } from '~/server/models/Setting';
import { emptyAddress } from '~/server/models/Order';

definePageMeta({
  layout: 'admin'
});

const { data: routePrivs, error } = await useFetch('/api/checkAuthRoutes');
if(error.value || !routePrivs.value.includes('Settings')) {
  navigateTo('/');
}

const errorStore = useErrorStore();

const tab = ref('orders');

/** ORDERS STUFF **/
const { data: payOnPickupAllowed } = await useFetch<SettingI>('/api/admin/settings/orders/checkout/allowPayOnPickup');
const { data: payOnPickupThreshold } = await useFetch<SettingI>('/api/admin/settings/orders/checkout/payOnPickupThreshold');
const { data: salesTax } = await useFetch<SettingI>('/api/admin/settings/orders/taxes/salesTax');

function changeAllowPayOnPickup() { $fetch('/api/admin/settings/orders/checkout/allowPayOnPickup', { 
  method: 'put', 
  body: { value: !payOnPickupAllowed.value?.value } 
});}
function savePayOnPickupThreshold() { $fetch('/api/admin/settings/orders/checkout/payOnPickupThreshold', {
  method: 'put',
  body: { value: editablePayOnPickupThreshold.value }
});}
function saveSalesTax() { $fetch('/api/admin/settings/orders/taxes/salesTax', {
  method: 'put',
  body: { value: editableSalesTax.value }
});}

const editablePayOnPickupAllowed = ref(payOnPickupAllowed.value?.value);
const editableSalesTax = ref(salesTax.value?.value);
const editablePayOnPickupThreshold = ref(payOnPickupThreshold.value?.value);


/** EXTERNAL APP STUFF **/

const { data: stripeApiKey } = await useFetch<SettingI>('/api/admin/settings/externalApps/checkout/stripeApiKey');
const { data: stripePublishableKey } = await useFetch<SettingI>('/api/admin/settings/externalApps/checkout/stripePublishableKey');
const { data: stripeAccountId } = await useFetch<SettingI>('/api/admin/settings/externalApps/checkout/stripeAccountId');
const editableStripeApiKey = ref(stripeApiKey.value?.value);
const editableStripePublishableKey = ref(stripePublishableKey.value?.value);
const editableStripeAccountId = ref(stripeAccountId.value?.value);

function updateStripeApiKey() {
  $fetch('/api/admin/settings/externalApps/checkout/stripeApiKey', {
    method: 'put',
    body: { value: editableStripeApiKey.value }
  });
}
function updateStripePublishableKey() {
  $fetch('/api/admin/settings/externalApps/checkout/stripePublishableKey', {
    method: 'put',
    body: { value: editableStripePublishableKey.value }
  });
}
function updateStripeAccountId() {
  $fetch('/api/admin/settings/externalApps/checkout/stripeAccountId', {
    method: 'put',
    body: { value: editableStripeAccountId.value }
  });
}

const { data: easyPostAPIKey } = await useFetch<SettingI>('/api/admin/settings/shipping/easypost/apikey');
const editableEasyPostAPIKey = ref(easyPostAPIKey.value?.value);

function updateEasyPostAPIKey() {
  $fetch('/api/admin/settings/shipping/easypost/apikey', {
    method: 'put',
    body: { value: editableEasyPostAPIKey.value }
  });
}

const { data: shipFromAddress } = await useFetch<SettingI>('/api/admin/settings/shipping/shipFrom/address');
const editableShipFromAddress = ref(shipFromAddress.value?.value || emptyAddress);

function updateShipFromAddress() {
  $fetch('/api/admin/settings/shipping/shipFrom/address', {
    method: 'put',
    body: { value: editableShipFromAddress.value }
  });

}

const { data: availableBins } = await useFetch<SettingI>('/api/admin/settings/shipping/config/bins');
const editableAvailableBins = ref((availableBins.value?.value || []) as DimensionsI[]);
function addBin() { editableAvailableBins.value.push({ length: 0, width: 0, height: 0 }); }
function removeBin(index: number) { editableAvailableBins.value.splice(index, 1); }
function saveBins() { 
  $fetch('/api/admin/settings/shipping/config/bins', {
    method: 'put',
    body: { value: editableAvailableBins.value }
  });
}
</script>

<template>

  <v-card
    class="sans-serif font-weight-light"
    rounded="0"
    title="Settings"
  >
    <v-tabs
      v-model="tab"
      bg-color="admin"
    >
      <v-tab value="orders">Orders</v-tab>
      <v-tab value="external_apps">External Apps</v-tab>
      <v-tab value="shipping">Shipping</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="orders">
          <v-card
            outlined
            class="ma-4 pa-4"
            title="Checkout"
          >
            <v-switch
              v-model="editablePayOnPickupAllowed"
              label="Allow Pay on Pickup"
              @change="changeAllowPayOnPickup"
            />
            <v-text-field
              label="Pay on Pickup Order Limit (0 for infinite)"
              type="number"
              v-model="editablePayOnPickupThreshold"
              :disabled="!editablePayOnPickupAllowed"
              @blur="savePayOnPickupThreshold"
              variant="outlined"
              :rules="currencyRules"
            />
          </v-card>
          <v-card
            outlined
            class="ma-4 pa-4"
            title="Taxes"
          >
            <v-text-field
              label="Sales Tax (Ex. 0.07 = 7%)"
              type="number"
              v-model="editableSalesTax"
              @blur="saveSalesTax"
              variant="outlined"
              :rules="positiveDecimalLessThanOneRules"
            />
          </v-card>
        </v-window-item>

        <v-window-item value="external_apps">
          <v-card
            outlined
            class="ma-4 pa-4"
            title="Stripe Checkout"
          >
            <v-text-field
              label="Stripe Publishable Key"
              v-model="editableStripePublishableKey"
              @blur="updateStripePublishableKey"
              variant="outlined"
            />
            <v-text-field
              label="Stripe Account ID"
              v-model="editableStripeAccountId"
              @blur="updateStripeAccountId"
              variant="outlined"
            />
            <v-text-field
              label="Stripe Secret Key (Recommended)"
              v-model="editableStripeApiKey"
              @blur="updateStripeApiKey"
              variant="outlined"
            />
          </v-card>
        </v-window-item>
        <v-window-item value="shipping">
          <v-card
            title="Shipping Info"
          >
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
                  v-model="editableShipFromAddress.fullname"
                  class="mr-4"
                  variant="outlined"
                  label="Name"
                ></v-text-field>
                <v-text-field
                  v-model="editableShipFromAddress.company"
                  variant="outlined"
                  label="Company (Only Fill if Shipping to your Business Location)"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="editableShipFromAddress.street1"
                  variant="outlined"
                  label="Street Line 1"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="editableShipFromAddress.street2"
                  variant="outlined"
                  label="Street Line 2"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="editableShipFromAddress.city"
                  variant="outlined"
                  label="City"
                ></v-text-field>
                <v-text-field
                  class="ml-4"
                  v-model="editableShipFromAddress.state"
                  variant="outlined"
                  label="State"
                ></v-text-field>
                <v-text-field
                  class="mx-4"
                  v-model="editableShipFromAddress.postalcode"
                  variant="outlined"
                  label="Zip Code"
                ></v-text-field>
                <v-text-field
                  v-model="editableShipFromAddress.country"
                  variant="outlined"
                  label="Country (e.g. US)"
                ></v-text-field>
              </v-row>
              <v-row
                class="px-4"
              >
                <v-text-field
                  v-model="editableShipFromAddress.phonenumber"
                  variant="outlined"
                  label="Phone Number"
                ></v-text-field>
              </v-row>
              <v-row
              >
                <v-btn
                  @click="updateShipFromAddress"
                  class="mb-4 ml-4"
                  block
                  color="admin"
                >Save Shipping Address</v-btn>
              </v-row>
            </v-form>
          </v-card>
          <v-card
            title="Shipping Box Sizes"
          >
            <v-row
              v-for="bin, i in editableAvailableBins"
              class="pa-4 ga-4"
            >
              <v-text-field 
                label="Length"
                v-model.number="bin.length"
                min="0"
                variant="outlined"
              />
              <v-text-field 
                label="Width"
                v-model.number="bin.width"
                min="0"
                variant="outlined"
              />
              <v-text-field 
                label="Height"
                v-model.number="bin.height"
                min="0"
                variant="outlined"
              />
              <v-btn
                color="error"
                icon="fas fa-trash-can"
                @click="removeBin(i)"
              ></v-btn>
            </v-row>
            <v-btn
              @click="addBin"
              block
              color="admin"
            >Add New Container</v-btn>
            <v-btn
              @click="saveBins"
              block
              class="my-2"
              color="admin"
            >Save Bins</v-btn>
          </v-card>
          <v-card
            title="EasyPost"
          >
            <v-text-field
              label="API Key"
              v-model="editableEasyPostAPIKey"
              @blur="updateEasyPostAPIKey"
              variant="outlined"
            />
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>

</template>
