import BigNumber from 'bignumber.js'

// Bank

/* istanbul ignore next */
export function SendTx(senderAddress, { to, coins }, network) {
  return {
    type: `bank/MsgSend`,
    value:
      coins.length === 1
        ? {
            from_address: senderAddress,
            to_address: to[0],
            amount: [Coin(coins[0], network.coinLookup)],
          }
        : {
            inputs: [
              {
                address: senderAddress,
                coins: coins.map((coin) => Coin(coin, network.coinLookup)),
              },
            ],
            outputs: [
              {
                address: to,
                coins: coins.map((coin) => Coin(coin, network.coinLookup)),
              },
            ],
          },
  }
}

// Staking
export function StakeTx(senderAddress, { to, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `staking/MsgDelegate`,
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
    type: `staking/MsgUndelegate`,
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
