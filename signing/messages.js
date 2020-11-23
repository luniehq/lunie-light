import BigNumber from 'bignumber.js'

// Bank

/* istanbul ignore next */
export function SendTx(senderAddress, { to, amounts }, network) {
  return {
    type: `cosmos-sdk/MsgSend`,
    value: {
      from_address: senderAddress,
      to_address: to[0],
      amount: amounts.map((amount) => Coin(amount, network.coinLookup)),
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

export function ClaimRewardsTx(
  senderAddress,
  {
    // amounts,
    from,
  }
) {
  /* istanbul ignore next */
  return from.map((validatorAddress) => ({
    type: `cosmos-sdk/MsgWithdrawDelegationReward`,
    value: {
      delegator_address: senderAddress,
      validator_address: validatorAddress,
    },
  }))
}

export function VoteTx(senderAddress, { proposalId, voteOption }) {
  const chainVoteOption = {
    Yes: 1,
    Abstain: 2,
    No: 3,
    NoWithVeto: 4,
  }[voteOption]
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgVote`,
    value: {
      voter: senderAddress,
      proposal_id: proposalId,
      option: chainVoteOption,
    },
  }
}

export function DepositTx(senderAddress, { proposalId, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgDeposit`,
    value: {
      depositor: senderAddress,
      proposal_id: proposalId,
      amount: [Coin(amount, network.coinLookup)],
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
  ClaimRewardsTx,
  VoteTx,
  DepositTx,
}
