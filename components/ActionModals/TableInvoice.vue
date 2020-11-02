<template>
  <div>
    <ul class="table-invoice">
      <li
        v-for="subTotal in subTotals"
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
          {{ fee.amount | fullDecimals }}
          {{ fee.denom !== transactionDenom ? fee.denom : transactionDenom }}
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

export default {
  name: `table-invoice`,
  filters: {
    fullDecimals,
  },
  props: {
    amounts: {
      type: Array,
      required: true,
    },
    fee: {
      type: Object,
      required: true,
    },
    transactionDenom: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    info: `Estimated network fees based on simulation.`,
    subTotals: [],
    totals: [],
  }),
  mounted() {
    this.totals = this.amounts
    this.subTotals = this.amounts.map((amount) => {
      if (amount.denom === this.fee.denom) {
        amount.amount = BigNumber(amount.amount)
          .minus(BigNumber(this.fee.amount))
          .toNumber()
      }
      return amount
    })
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
