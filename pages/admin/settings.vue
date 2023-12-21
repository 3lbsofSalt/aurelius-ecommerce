<script setup lang="ts">
import type { SettingI } from '~/server/models/Setting';

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

const { data: shipstationAPIKey } = await useFetch<SettingI>('/api/admin/settings/externalApps/shipping/shipStationAPIKey');
const { data: shipstationAPISecret } = await useFetch<SettingI>('/api/admin/settings/externalApps/shipping/shipStationAPISecret');
const { data: shipFromZipCode } = await useFetch<SettingI>('/api/admin/settings/externalApps/shipping/shipFromZipCode');
const editableShipstationAPIKey = ref(shipstationAPIKey.value?.value);
const editableShipstationAPISecret = ref(shipstationAPISecret.value?.value);
const editableShipFromZipCode = ref(shipFromZipCode.value?.value);

function updateShipstationAPIKey() {
  $fetch('/api/admin/settings/externalApps/shipping/shipStationAPIKey', {
    method: 'put',
    body: { value: editableShipstationAPIKey.value }
  });
}
function updateShipstationAPISecret() {
  $fetch('/api/admin/settings/externalApps/shipping/shipStationAPISecret', {
    method: 'put',
    body: { value: editableShipstationAPISecret.value }
  });
}
function updateShipFromZipCode() {
  $fetch('/api/admin/settings/externalApps/shipping/shipFromZipCode', {
    method: 'put',
    body: { value: editableShipFromZipCode.value }
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
          <v-card
            outlined
            class="ma-4 pa-4"
            title="ShipStation"
          >
            <v-text-field
              label="Shipstation API Key"
              v-model="editableShipstationAPIKey"
              @blur="updateShipstationAPIKey"
              variant="outlined"
            />
            <v-text-field
              label="Shipstation API Secret"
              v-model="editableShipstationAPISecret"
              @blur="updateShipstationAPISecret"
              variant="outlined"
            />
            <v-text-field
              label="From Zip Code"
              v-model="editableShipFromZipCode"
              @blur="updateShipFromZipCode"
              variant="outlined"
            />
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>

</template>
