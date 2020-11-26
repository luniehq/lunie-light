<template>
  <div>
    <FormGroup
      v-if="getDenoms.length > 1"
      id="form-group-amount"
      class="action-modal-form-group"
      field-id="feeDenom"
      field-label="Select Fee"
    >
      <div class="row">
        <Field
          id="amount"
          ref="amount"
          :value="selectedFee.amount"
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <Field
          id="token"
          v-model="feeDenom"
          :title="`Select the token you wish to use`"
          :options="getDenoms"
          class="tm-field-token-selector"
          type="select"
        />
      </div>
    </FormGroup>
    <ul class="table-invoice">
      <li
        v-for="(subTotal, index) in amounts"
        :key="`${subTotal.denom}-subtotal`"
        class="sub-total"
      >
        <template v-if="subTotal.amount">
          <span>{{ index === 0 ? 'Subtotal' : '' }}</span>
          <span>
            {{ subTotal.amount | fullDecimals }} {{ subTotal.denom }}
          </span>
        </template>
      </li>
      <li class="fees">
        <span>Network Fee</span>
        <span>
          {{ selectedFee.amount | fullDecimals }}
          {{ selectedFee.denom }}
        </span>
      </li>
      <li
        v-for="(total, index) in totals"
        :key="`${total.denom}-total`"
        class="total-row"
      >
        <span>{{ index === 0 ? 'Total' : '' }}</span>
        <div class="total-column">
          <p>{{ total.amount | fullDecimals }} {{ total.denom }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { fullDecimals } from '~/common/numbers'
import network from '~/common/network'

export default {
  name: `TableInvoice`,
  filters: {
    fullDecimals,
  },
  model: {
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
    selectedFeeDenom: null,
  }),
  computed: {
    feeDenom: {
      get() {
        // default to a denom if there is the only one being transacted and it has feeOptions specified
        const transactionDenom =
          this.amounts.length === 1 &&
          this.fees.find(({ denom }) => denom === this.amounts[0].denom)
            ? this.amounts[0].denom
            : null
        return this.selectedFeeDenom
          ? this.selectedFeeDenom
          : transactionDenom || network.stakingDenom
      },
      set(value) {
        this.selectedFeeDenom = value
        this.$emit('change', value)
      },
    },
    getDenoms() {
      return this.fees.map(({ denom }) => ({ key: denom, value: denom }))
    },
    selectedFee() {
      return this.fees.find(({ denom }) => denom === this.feeDenom)
    },
    totals() {
      return this.amounts.concat(this.selectedFee).reduce((all, amount) => {
        const existantCoin = all.find(({ denom }) => amount.denom === denom)
        if (existantCoin) {
          return all
            .filter(({ denom }) => amount.denom !== denom)
            .concat({
              ...existantCoin,
              amount: Number(existantCoin.amount) + Number(amount.amount),
            })
        }
        return all.concat(amount)
      }, [])
    },
  },
}
</script>
<style scoped>
.table-invoice {
  margin: 2rem 0 0;
  border-collapse: inherit;
  padding: 0 0.25rem;
  font-size: var(--text-xs);
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

.fees {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--gray-300);
}

.fees + .total-row {
  padding-top: 0.5rem;
}

.total-column {
  display: flex;
  flex-direction: column;
}

.tm-field-addon {
  border-right: none;
}

.tm-field-token-selector >>> .tm-field-select {
  border-left: 0;
  border-radius: 0 !important;
}

.tm-field-token-selector >>> .tm-field-select:focus {
  border-color: var(--input-bc);
}

.tm-field-token-selector >>> .tm-field-select-addon {
  border: 0;
}
</style>
