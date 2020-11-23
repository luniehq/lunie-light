<template>
  <tr
    class="validator-row"
    :data-name="validator.name"
    @click="$router.push(`/validators/${validator.operatorAddress}`)"
  >
    <td class="cell index">{{ index + 1 }}</td>
    <td class="cell">
      <Status :label="validator.status" />
    </td>
    <td class="cell validator-info">
      <Avatar
        class="validator-image"
        alt="generic validator logo - generated avatar from address"
        :address="validator.operatorAddress"
      />
      <div class="row">
        <h3 class="validator-name">
          {{ validator.name }}
        </h3>
        <template v-if="!undelegation">
          <div v-if="delegation.amount > 0">
            <h4>
              {{ delegation.amount | bigFigureOrShortDecimals }}
            </h4>
            <h5
              v-if="
                rewards.find(
                  (reward) =>
                    reward.denom === stakingDenom && reward.amount > 0.000001
                )
              "
            >
              <span
                >+{{
                  filterStakingDenomReward() | bigFigureOrShortDecimals
                }}</span
              >
            </h5>
          </div>
        </template>
        <template v-else>
          <h4>{{ undelegation.amount }}</h4>
        </template>
      </div>
    </td>
    <template v-if="!undelegation">
      <td class="cell">
        {{
          validator.expectedReturns
            ? bigFigureOrPercent(validator.expectedReturns)
            : `--`
        }}
      </td>
      <td class="cell">
        {{ validator.votingPower | bigFigureOrPercent }}
      </td>
    </template>
    <template v-else>
      <td>
        {{ undelegation.endTime | fromNow }}
      </td>
    </template>
  </tr>
</template>

<script>
import {
  bigFigureOrPercent,
  bigFigureOrShortDecimals,
} from '../../common/numbers'
import { fromNow } from '~/common/time'

export default {
  name: `ValidatorRow`,
  components: {},
  filters: {
    bigFigureOrShortDecimals,
    bigFigureOrPercent,
    fromNow,
  },
  props: {
    validator: {
      type: Object,
      required: true,
    },
    /* istanbul ignore next */
    delegation: {
      type: Object,
      default: () => ({}),
    },
    /* istanbul ignore next */
    rewards: {
      type: Array,
      default: () => [],
    },
    index: {
      type: Number,
      required: true,
    },
    stakingDenom: {
      type: String,
      default: '',
    },
    undelegation: {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    bigFigureOrPercent,
    bigFigureOrShortDecimals,
    filterStakingDenomReward() {
      const stakingDenomRewards = this.rewards.filter(
        (reward) => reward.denom === this.stakingDenom
      )
      return stakingDenomRewards.length > 0 ? stakingDenomRewards[0].amount : 0
    },
  },
}
</script>
<style scoped>
.validator-row {
  border-bottom: 1px solid var(--bc-dim);
}

td {
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  vertical-align: middle;
}

h4,
h5 {
  font-size: var(--text-xs);
}

h5 span {
  color: var(--success);
}

.validator-row:hover {
  cursor: pointer;
  background: var(--gray-100);
  color: var(--bright);
}

.validator-image {
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  margin-right: 1rem;
}

.validator-info {
  display: flex;
  align-items: center;
}

.row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.validator-name {
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 18rem;
}
</style>
