<script setup lang="ts">
const cartStore = useCartStore();
</script>
<template>

  <v-container 
    fluid
  >
    <v-row>
      <v-col
        cols="9"
      >
        <v-card
          class="text-primary"
          flat
        >
          <template v-slot:title>
            <div class="text-h3">Cart</div>
          </template>
          <v-card
            no-gutters
            v-for="item, i in cartStore.cart.items"
            class="text-primary mt-2"
            rounded="0"
            variant="outlined"
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
                    type="number"
                    density="compact"
                    :model-value="item.quantity"
                    rounded="0"
                    class="mr-2"
                    label="Quantity"
                    :readonly="(item.item.customerInputFields?.length || 0) > 0"
                    @update:model-value="value => cartStore.updateTotalQuantity(item.item._id, Number.parseInt(value))"
                  />
                  <v-btn
                    color="error"
                    variant="text"
                    icon="fas fa-trash-can"
                    @click="cartStore.removeItemFromCart(i)"
                  ></v-btn>
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
          </v-card>
        </v-card>
      </v-col>
      <v-col
        cols="3"
      >
        <v-card
          class="text-primary"
          flat
        >
          <template v-slot:title>
            <div class="text-h3 mb-2">Totals</div>
          </template>
          <v-card
            flat
            class="pa-4 text-primary"
            rounded="0"
          >
            <v-row
              justify="space-between"
            >
              <div
                class="text-h5 font-weight-bold sans-serif ml-2"
              >Total Items: </div>
              <div
                class="font-weight-bold sans-serif mr-4 text-h5"
              >{{cartStore.totalQuantity}}</div>
            </v-row>
            <v-row
              justify="space-between"
            >
              <div
                class="text-h5 font-weight-bold sans-serif ml-2"
              >Subtotal: </div>
              <div
                class="font-weight-bold sans-serif mr-4 text-h5"
              >${{cartStore.total.toFixed(2)}}</div>
            </v-row>
            <v-row>
              <v-btn
                block
                color="primary"
                class="sans-serif"
                variant="outlined"
                rounded="0"
                to="/checkout"
              >
                CHECKOUT
              </v-btn>
            </v-row>
            <v-row>
              <div
                class="text-caption"
              >
                Taxes and shipping will be calculated at checkout
              </div>
            </v-row>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
