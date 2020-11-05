import BigNumber from 'bignumber.js'

// Bank

/* istanbul ignore next */
export function SendTx(senderAddress, { to, amount }, network) {
  return {
    type: `cosmos-sdk/MsgSend`,
    value: {
      from_address: senderAddress,
      to_address: to[0],
      amount: [Coin(amount, network.coinLookup)],
    },
  }
}

// Staking
export function StakeTx(senderAddress, { to, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgDelegate`,
    value: {
      delegator_address: senderAddress,
      validator_address: to[0],
      amount: Coin(amount, network.coinLookup),
    },
  }
}

export function UnstakeTx(senderAddress, { from, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgUndelegate`,
    value: {
      validator_address: from[0],
      delegator_address: senderAddress,
      amount: Coin(amount, network.coinLookup),
    },
  }
}

export function Coin({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  return {
    amount: BigNumber(amount)
      .dividedBy(lookup.chainToViewConversionFactor)
      .toFixed(),
    denom: lookup.chainDenom,
  }
}

export default {
  SendTx,
  StakeTx,
  UnstakeTx,
}
