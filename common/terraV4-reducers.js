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

module.exports = {
  ...cosmosV2Reducers,
  blockReducer: cosmosV3Reducers.blockReducer,
  delegationReducer,
}
