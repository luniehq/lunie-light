<template>
  <div>
    <TmFormGroup
      v-if="getDenoms.length > 1"
      id="form-group-amount"
      class="action-modal-form-group"
      field-id="feeDenom"
      field-label="Select Fee"
    >
      <TmFieldGroup>
        <TmField
          id="amount"
          ref="amount"
          :is-disabled="true"
          :value="selectedFee.amount"
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmField
          id="token"
          v-model="feeDenom"
          :title="`Select the token you wish to use`"
          :options="getDenoms"
          class="tm-field-token-selector"
          type="select"
        />
      </TmFieldGroup>
    </TmFormGroup>
    <ul class="table-invoice">
      <li
        v-for="subTotal in amounts"
        :key="`${subTotal.denom}-subtotal`"
        class="sub-total"
      >
        <span v-if="subTotal.amount > 0">Subtotal</span>
        <span v-if="subTotal.amount > 0">
          {{ subTotal.amount | fullDecimals }} {{ subTotal.denom }}
        </span>
      </li>
      <li class="fees">
        <span>Network Fee</span>
        <span>
          {{ selectedFee.amount | fullDecimals }}
          {{ selectedFee.denom }}
        </span>
      </li>
      <li
        v-for="total in totals"
        :key="`${total.denom}-total`"
        class="total-row"
      >
        <span>Total</span>
        <div class="total-column">
          <p>{{ total.amount | fullDecimals }} {{ total.denom }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import BigNumber from 'bignumber.js'
import { fullDecimals } from '../../common/numbers'
import network from '~/network'

export default {
  name: `table-invoice`,
  filters: {
    fullDecimals,
  },
  model: {
    prop: 'feeDenom',
    event: 'change',
  },
  props: {
    amounts: {
      type: Array,
      required: true,
    },
    fees: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    feeDenom: network.stakingDenom,
  }),
  computed: {
    getDenoms() {
      return this.fees.map(({ denom }) => ({ key: denom, value: denom }))
    },
    selectedFee() {
      return this.fees.find(({ denom }) => denom === this.feeDenom)
    },
    totals() {
      return this.amounts.map((amount) => {
        if (amount.denom === this.selectedFee.denom) {
          return {
            ...amount,
            amount: BigNumber(amount.amount)
              .plus(BigNumber(this.selectedFee.amount))
              .toNumber(),
          }
        }
        return amount
      })
    },
  },
  watch: {
    feeDenom(feeDenom) {
      this.$emit('change:feeDenom', feeDenom)
    },
  },
}
</script>
<style scoped>
.table-invoice {
  margin: 2rem 0 0;
  border-collapse: inherit;
  padding: 0 0.25rem;
  font-size: var(--sm);
  letter-spacing: 0.4px;
}

.table-invoice li {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-invoice span {
  padding: 0;
  color: var(--dim);
}

.table-invoice span:not(:first-child) {
  text-align: right;
}

.total-row {
  border-top: 2px solid var(--bc);
  margin-top: 0.5rem;
  padding-top: 0.25rem;
}

.total-column {
  display: flex;
  flex-direction: column;
}
</style>
