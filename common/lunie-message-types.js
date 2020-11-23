const lunieMessageTypes = {
  SEND: `SendTx`,
  IBC_SEND: `IbcSendTx`,
  STAKE: `StakeTx`,
  RESTAKE: `RestakeTx`,
  UNSTAKE: `UnstakeTx`,
  VOTE: `VoteTx`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `ClaimRewardsTx`,
  SUBMIT_PROPOSAL: `SubmitProposalTx`,
  UNKNOWN: `UnknownTx`,
}

module.exports = { lunieMessageTypes }
