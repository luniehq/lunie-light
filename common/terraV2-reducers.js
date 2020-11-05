const cosmosV2Reducers = require('./cosmosV2-reducers')
const cosmosV3Reducers = require('./cosmosV3-reducers')

function delegationReducer(delegation, validator, active) {
  return {
    id: delegation.validator_address,
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: delegation.balance
      ? cosmosV3Reducers.atoms(delegation.balance.amount)
      : 0, // atoms function should be switched for a coinLookup
    active,
  }
}

function blockHeaderReducer(networkId, block) {
  return {
    id: block.block_id.hash,
    networkId,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    hash: block.block_id.hash,
    time: block.block.header.time,
    proposer_address: block.block.header.proposer_address,
  }
}

module.exports = {
  ...cosmosV2Reducers,
  blockReducer: cosmosV3Reducers.blockReducer,
  delegationReducer,
  blockHeaderReducer,
}
