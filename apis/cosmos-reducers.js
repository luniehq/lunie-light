const BigNumber = require('bignumber.js')
const { reverse, sortBy, uniq, uniqWith } = require('lodash')
const { encodeB32, decodeB32 } = require('~/common/address')
const { fixDecimalsAndRoundUp } = require('~/common/numbers.js')
const { getProposalSummary } = require('~/common/common-reducers')
const { lunieMessageTypes } = require('~/common/lunie-message-types')
/**
 * Modify the following reducers with care as they are used for ./cosmosV2-reducer.js as well
 * [proposalBeginTime, proposalEndTime, getDeposit, tallyReducer, atoms, getValidatorStatus, coinReducer]
 */

function proposalBeginTime(proposal) {
  switch (proposal.proposal_status.toLowerCase()) {
    case 'depositperiod':
      return proposal.submit_time
    case 'votingperiod':
      return proposal.voting_start_time
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function proposalEndTime(proposal) {
  switch (proposal.proposal_status.toLowerCase()) {
    case 'depositperiod':
      return proposal.deposit_end_time
    case 'votingperiod':
    // the end time lives in the past already if the proposal is finalized
    // eslint-disable-next-line no-fallthrough
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function proposalFinalized(proposal) {
  return ['Passed', 'Rejected'].includes(proposal.proposal_status)
}

function accountInfoReducer(accountValue, accountType) {
  if (accountType.includes(`VestingAccount`)) {
    accountValue = accountValue.BaseVestingAccount.BaseAccount
  }
  return {
    address: accountValue.address,
    accountNumber: accountValue.account_number,
    sequence: accountValue.sequence || 0,
    vestingAccount: accountType.includes(`VestingAccount`),
  }
}

function atoms(nanoAtoms) {
  return BigNumber(nanoAtoms).div(1000000).toFixed(6)
}

const calculateTokens = (validator, shares) => {
  // this is the based on the idea that tokens should equal
  // (myShares / totalShares) * totalTokens where totalShares
  // and totalTokens are both represented as fractions
  const myShares = new BigNumber(shares || 0)
  const totalShares = new BigNumber(validator.delegatorShares)
  const totalTokens = new BigNumber(validator.tokens)

  if (totalShares.eq(0)) return new BigNumber(0)
  return myShares.times(totalTokens).div(totalShares).toFixed(6)
}

/* if you don't get this, write fabian@lunie.io */
// expected rewards if delegator stakes x tokens
const expectedRewardsPerToken = (validator, commission, annualProvision) => {
  if (validator.status === 'INACTIVE' || validator.jailed === true) {
    return 0
  }

  // share of all provisioned block rewards all delegators of this validator get
  const totalAnnualValidatorRewards = BigNumber(validator.votingPower).times(
    annualProvision
  )
  // the validator takes a cut in amount of the commission
  const totalAnnualDelegatorRewards = totalAnnualValidatorRewards.times(
    BigNumber(1).minus(commission)
  )

  // validator.tokens is the amount of all tokens delegated to that validator
  // one token delegated would receive x percentage of all delegator rewards
  const delegatorSharePerToken = BigNumber(1).div(validator.tokens)
  const annualDelegatorRewardsPerToken = totalAnnualDelegatorRewards.times(
    delegatorSharePerToken
  )
  return annualDelegatorRewardsPerToken
}

// reduce deposits to one number
function getDeposit(proposal) {
  return atoms(
    proposal.total_deposit.reduce(
      (sum, cur) => sum.plus(cur.amount),
      BigNumber(0)
    )
  )
}

function getTotalVotePercentage(proposal, totalBondedTokens, totalVoted) {
  // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
  if (proposalFinalized(proposal)) return -1
  if (BigNumber(totalVoted).eq(0)) return 0
  if (!totalBondedTokens) return -1
  return Number(
    BigNumber(totalVoted).div(atoms(totalBondedTokens)).toNumber().toFixed(6)
  )
}

function tallyReducer(proposal, tally, totalBondedTokens) {
  // if the proposal is out of voting, use the final result for the tally
  if (proposalFinalized(proposal)) {
    tally = proposal.final_tally_result
  }

  const totalVoted = atoms(
    BigNumber(tally.yes)
      .plus(tally.no)
      .plus(tally.abstain)
      .plus(tally.no_with_veto)
  )

  return {
    yes: atoms(tally.yes),
    no: atoms(tally.no),
    abstain: atoms(tally.abstain),
    veto: atoms(tally.no_with_veto),
    total: totalVoted,
    totalVotedPercentage: getTotalVotePercentage(
      proposal,
      totalBondedTokens,
      totalVoted
    ),
  }
}

function depositReducer(deposit, network, store) {
  const coinLookup = network.getCoinLookup(network.stakingDenom)
  return {
    id: deposit.depositor,
    amount: [coinReducer(deposit.amount[0], coinLookup)],
    depositer: networkAccountReducer(deposit.depositor, store.validators),
  }
}

function voteReducer(vote, store) {
  return {
    id: String(vote.proposal_id.concat(`_${vote.voter}`)),
    voter: networkAccountReducer(vote.voter, store.validators),
    option: vote.option,
  }
}

function networkAccountReducer(address, validators) {
  const proposerValAddress = address
    ? encodeB32(decodeB32(address), `cosmosvaloper`, `hex`)
    : ''
  const validator =
    validators && proposerValAddress.length > 0
      ? validators[proposerValAddress]
      : undefined
  return {
    name: validator ? validator.name : undefined,
    address: address || '',
    picture: validator ? validator.picture : '',
    validator,
  }
}

function governanceParameterReducer(
  depositParameters,
  tallyingParamers,
  network
) {
  return {
    votingThreshold: tallyingParamers.threshold,
    vetoThreshold: tallyingParamers.veto,
    // for now assuming one deposit denom
    depositDenom: denomLookup(
      network.coinLookup,
      depositParameters.min_deposit[0].denom
    ),
    depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
      1000000
    ),
  }
}

function topVoterReducer(topVoter) {
  return {
    name: topVoter.name,
    address: topVoter.operatorAddress,
    votingPower: topVoter.votingPower,
    picture: topVoter.picture,
    validator: topVoter,
  }
}

function getValidatorStatus(validator) {
  if (validator.status === 2) {
    return {
      status: 'ACTIVE',
      status_detailed: 'active',
    }
  }
  if (
    validator.signing_info &&
    new Date(validator.signing_info.jailed_until) > new Date(9000, 1, 1)
  ) {
    return {
      status: 'INACTIVE',
      status_detailed: 'banned',
    }
  }

  return {
    status: 'INACTIVE',
    status_detailed: 'inactive',
  }
}

function blockReducer(networkId, block, transactions, data = {}) {
  return {
    id: block.block_id.hash,
    networkId,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    hash: block.block_id.hash,
    time: block.block.header.time,
    transactions,
    proposer_address: block.block.header.proposer_address,
    data: JSON.stringify(data),
  }
}

function blockHeaderReducer(networkId, block) {
  return {
    id: block.block_meta.block_id.hash,
    networkId,
    height: block.block_meta.header.height,
    chainId: block.block_meta.header.chain_id,
    hash: block.block_meta.block_id.hash,
    time: block.block_meta.header.time,
    proposer_address: block.block_meta.header.proposer_address,
  }
}

function denomLookup(coinLookup, denom) {
  if (
    Array.isArray(coinLookup) &&
    coinLookup.find(({ chainDenom }) => chainDenom === denom)
  ) {
    return coinLookup.find(({ chainDenom }) => chainDenom === denom).viewDenom
  }
  return coinLookup.viewDenom ? coinLookup.viewDenom : denom.toUpperCase()
}

function coinReducer(coin, coinLookup) {
  if (!coin) {
    return {
      amount: 0,
      denom: '',
    }
  }

  if (!coinLookup) {
    return {
      amount: -1,
      denom: '[UNSUPPORTED] ' + coin.denom,
    }
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coinLookup, coin.denom)

  return {
    denom,
    amount: BigNumber(coin.amount)
      .times(coinLookup.chainToViewConversionFactor || 6)
      .toNumber(),
  }
}

function gasPriceReducer(gasPrice, coinLookup) {
  if (!gasPrice) {
    throw new Error(
      'The token you are trying to request data for is not supported by Lunie.'
    )
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coinLookup, gasPrice.denom)
  return {
    denom,
    price: BigNumber(gasPrice.price).div(1000000), // Danger: this might not be the case for all future tokens
  }
}

// delegations rewards in Tendermint are located in events as strings with this form:
// amount: {"15000umuon"}, or in multidenom networks they look like this:
// amount: {"15000ungm,100000uchf,110000ueur,2000000ujpy"}
// That is why we need this separate function to extract those amounts in this format
function rewardCoinReducer(reward, network) {
  const multiDenomRewardsArray = reward.split(`,`)
  const mappedMultiDenomRewardsArray = multiDenomRewardsArray.map((reward) => {
    const denom = denomLookup(network.coinLookup, reward.match(/[a-z]+/gi)[0])
    const coinLookup = network.getCoinLookup(denom, `viewDenom`)
    return {
      denom,
      amount: BigNumber(reward.match(/[0-9]+/gi)).times(
        coinLookup.chainToViewConversionFactor
      ),
    }
  })
  return mappedMultiDenomRewardsArray
}

function balanceReducer(coin, gasPrices, fiatValue, fiatCurrency, network) {
  return {
    id: coin.denom,
    ...coin,
    fiatValue,
    gasPrice: gasPrices
      ? gasPriceReducer(
          gasPrices.find(
            (gasPrice) =>
              denomLookup(network.coinLookup, gasPrice.denom) === coin.denom
          ),
          network.coinLookup
        ).price
      : null,
  }
}

async function balanceV2Reducer(
  lunieCoin,
  stakingDenom,
  delegations,
  undelegations,
  fiatValueAPI,
  fiatCurrency,
  address
) {
  const isStakingDenom = lunieCoin.denom === stakingDenom
  const delegatedStake = delegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const undelegatingStake = undelegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const total = isStakingDenom
    ? BigNumber(lunieCoin.amount).plus(delegatedStake).plus(undelegatingStake)
    : lunieCoin.amount
  let fiatValue, availableFiatValue
  if (fiatValueAPI) {
    fiatValue = await fiatValueAPI.calculateFiatValues(
      [
        {
          ...lunieCoin,
          amount: total,
        },
      ],
      fiatCurrency
    )[lunieCoin.denom]
    availableFiatValue = await fiatValueAPI.calculateFiatValues(
      [lunieCoin],
      fiatCurrency
    )[stakingDenom]
  }
  return {
    id: lunieCoin.denom,
    type: isStakingDenom ? 'STAKE' : 'CURRENCY',
    total,
    denom: lunieCoin.denom,
    fiatValue,
    available: lunieCoin.amount,
    staked: delegatedStake.amount || 0,
    availableFiatValue,
  }
}

function undelegationReducer(undelegation, validator) {
  return {
    id: `${validator.operatorAddress}_${undelegation.creation_height}`,
    delegatorAddress: undelegation.delegator_address,
    validator,
    amount: atoms(undelegation.balance),
    startHeight: undelegation.creation_height,
    endTime: undelegation.completion_time,
  }
}

async function reduceFormattedRewards(
  reward,
  validator,
  fiatCurrency,
  calculateFiatValue,
  reducers,
  multiDenomRewardsArray,
  network
) {
  await Promise.all(
    reward.map(async (denomReward) => {
      const coinLookup = network.getCoinLookup(denomReward.denom)
      const lunieCoin = coinReducer(denomReward, coinLookup)
      if (lunieCoin.amount < 0.000001) return

      const fiatValue = calculateFiatValue
        ? await calculateFiatValue(lunieCoin, fiatCurrency)
        : undefined
      multiDenomRewardsArray.push({
        id: `${validator.operatorAddress}_${lunieCoin.denom}_${fiatCurrency}`,
        denom: lunieCoin.denom,
        amount: fixDecimalsAndRoundUp(lunieCoin.amount, 6).toString(), // TODO: refactor using a decimals number from coinLookup
        fiatValue,
        validator,
      })
    })
  )
}

async function rewardReducer(
  rewards,
  validatorsDictionary,
  fiatCurrency,
  calculateFiatValue,
  reducers,
  network
) {
  const formattedRewards = rewards.map((reward) => ({
    reward: reward.reward,
    validator: validatorsDictionary[reward.validator_address],
  }))
  const multiDenomRewardsArray = []
  await Promise.all(
    formattedRewards.map(({ reward, validator }) =>
      reduceFormattedRewards(
        reward,
        validator,
        fiatCurrency,
        calculateFiatValue,
        reducers,
        multiDenomRewardsArray,
        network
      )
    )
  )
  return multiDenomRewardsArray
}

const proposalTypeEnumDictionary = {
  TextProposal: 'TEXT',
  CommunityPoolSpendProposal: 'TREASURY',
  ParameterChangeProposal: 'PARAMETER_CHANGE',
}

// map Cosmos SDK message types to Lunie message types
function getMessageType(type) {
  // different networks use different prefixes for the transaction types like cosmos/MsgSend vs core/MsgSend in Terra
  const transactionTypeSuffix = type.split('/')[1]
  switch (transactionTypeSuffix) {
    case 'MsgSend':
      return lunieMessageTypes.SEND
    case 'MsgDelegate':
      return lunieMessageTypes.STAKE
    case 'MsgBeginRedelegate':
      return lunieMessageTypes.RESTAKE
    case 'MsgUndelegate':
      return lunieMessageTypes.UNSTAKE
    case 'MsgWithdrawDelegationReward':
      return lunieMessageTypes.CLAIM_REWARDS
    case 'MsgSubmitProposal':
      return lunieMessageTypes.SUBMIT_PROPOSAL
    case 'MsgVote':
      return lunieMessageTypes.VOTE
    case 'MsgDeposit':
      return lunieMessageTypes.DEPOSIT
    default:
      return lunieMessageTypes.UNKNOWN
  }
}

function setTransactionSuccess(transaction, index) {
  // TODO identify logs per message
  if (transaction.code) {
    return false
  }
  return true
}

function sendDetailsReducer(message, reducers, network) {
  const coinLookup = network.getCoinLookup(
    message.amount ? message.amount[0].denom : network.stakingDenom
  )
  return {
    from: [message.from_address],
    to: [message.to_address],
    amount: coinReducer(message.amount[0], coinLookup),
  }
}

function stakeDetailsReducer(message, reducers, network) {
  const coinLookup = network.getCoinLookup(message.amount.denom)
  return {
    to: [message.validator_address],
    amount: coinReducer(message.amount, coinLookup),
  }
}

function restakeDetailsReducer(message, reducers, network) {
  const coinLookup = network.getCoinLookup(message.amount.denom)
  return {
    from: [message.validator_src_address],
    to: [message.validator_dst_address],
    amount: coinReducer(message.amount, coinLookup),
  }
}

function unstakeDetailsReducer(message, reducers, network) {
  const coinLookup = network.getCoinLookup(message.amount.denom)
  return {
    from: [message.validator_address],
    amount: coinReducer(message.amount, coinLookup),
  }
}

function claimRewardsDetailsReducer(message, reducers, transaction, network) {
  return {
    from: message.validators,
    amounts: claimRewardsAmountReducer(transaction, reducers, network),
  }
}

function claimRewardsAmountReducer(transaction, reducers, network) {
  const transactionClaimEvents =
    transaction.events &&
    transaction.events.filter((event) => event.type === `transfer`)
  if (!transactionClaimEvents) {
    return [{ denom: '', amount: 0 }]
  }
  // filter out unsuccessful messages
  if (transaction.logs) {
    transaction.logs.forEach((log, index) => {
      if (log.success !== true) {
        transactionClaimEvents.splice(index, 1)
      }
    })
  }
  // if transactionClaimEvents is empty after the successful transaction check, we default it
  if (transactionClaimEvents.length === 0) {
    return [{ denom: '', amount: 0 }]
  }
  const amountAttributes = transactionClaimEvents
    .map((tx) => tx.attributes)
    .find((attributes) => attributes.length > 0)
    .filter((attribute) => attribute.key === `amount`)
  const allClaimedRewards = amountAttributes
    .map((amount) => amount.value)
    .map((rewardValue) => rewardCoinReducer(rewardValue, network))
  const aggregatedClaimRewardsObject = allClaimedRewards.reduce(
    (all, rewards) => {
      rewards.forEach((reward) => {
        all = {
          ...all,
          [reward.denom]: reward.amount.plus(all[reward.denom] || 0),
        }
      })
      return all
    },
    {}
  )
  const claimedRewardsDenomArray = Object.entries(aggregatedClaimRewardsObject)
  return claimedRewardsDenomArray.map(([denom, amount]) => ({ denom, amount }))
}

function submitProposalDetailsReducer(message, reducers, network) {
  const coinLookup = network.getCoinLookup(message.initial_deposit[0].denom)
  return {
    proposalType: message.content.type,
    proposalTitle: message.content.value.title,
    proposalDescription: message.content.value.description,
    initialDeposit: coinReducer(message.initial_deposit[0], coinLookup),
  }
}

function voteProposalDetailsReducer(message) {
  return {
    proposalId: message.proposal_id,
    voteOption: message.option,
  }
}

function depositDetailsReducer(message, reducers, network) {
  const coinLookup = network.getCoinLookup(message.amount[0].denom)
  return {
    proposalId: message.proposal_id,
    amount: coinReducer(message.amount[0], coinLookup),
  }
}

// function to map cosmos messages to our details format
function transactionDetailsReducer(
  type,
  message,
  reducers,
  transaction,
  network
) {
  let details
  switch (type) {
    case lunieMessageTypes.SEND:
      details = sendDetailsReducer(message, reducers, network)
      break
    case lunieMessageTypes.STAKE:
      details = stakeDetailsReducer(message, reducers, network)
      break
    case lunieMessageTypes.RESTAKE:
      details = restakeDetailsReducer(message, reducers, network)
      break
    case lunieMessageTypes.UNSTAKE:
      details = unstakeDetailsReducer(message, reducers, network)
      break
    case lunieMessageTypes.CLAIM_REWARDS:
      details = claimRewardsDetailsReducer(
        message,
        reducers,
        transaction,
        network
      )
      break
    case lunieMessageTypes.SUBMIT_PROPOSAL:
      details = submitProposalDetailsReducer(message, reducers, network)
      break
    case lunieMessageTypes.VOTE:
      details = voteProposalDetailsReducer(message, reducers, network)
      break
    case lunieMessageTypes.DEPOSIT:
      details = depositDetailsReducer(message, reducers, network)
      break
    default:
      details = {}
  }

  return {
    type,
    ...details,
  }
}

function claimRewardsMessagesAggregator(claimMessages) {
  // reduce all withdraw messages to one one collecting the validators from all the messages
  const onlyValidatorsAddressesArray = claimMessages.map(
    (msg) => msg.value.validator_address
  )
  return {
    type: `cosmos-sdk/MsgWithdrawDelegationReward`,
    value: {
      validators: onlyValidatorsAddressesArray,
    },
  }
}

function proposalReducer(
  networkId,
  proposal,
  tally,
  proposer,
  totalBondedTokens,
  detailedVotes,
  reducers,
  validators
) {
  return {
    networkId,
    id: Number(proposal.id),
    proposalId: String(proposal.id),
    type: proposalTypeEnumDictionary[proposal.content.type.split('/')[1]],
    title: proposal.content.value.title,
    description: proposal.content.value.changes
      ? `Parameter: ${JSON.stringify(proposal.content.value.changes, null, 4)}`
      : `` + `\nDescription: ${proposal.content.value.description}`,
    creationTime: proposal.submit_time,
    status: proposal.proposal_status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, tally, totalBondedTokens),
    deposit: getDeposit(proposal, 'stake'), // TODO use denom lookup + use network config
    proposer: proposer
      ? networkAccountReducer(proposer.proposer, validators)
      : undefined,
    summary: getProposalSummary(
      proposalTypeEnumDictionary[proposal.content.type.split('/')[1]]
    ),
    detailedVotes,
  }
}

function transactionReducerV2(network, transaction, reducers) {
  try {
    // TODO check if this is anywhere not an array
    let fees
    if (
      transaction.tx.value &&
      Array.isArray(transaction.tx.value.fee.amount)
    ) {
      fees = transaction.tx.value.fee.amount.map((coin) => {
        const coinLookup = network.getCoinLookup(coin.denom)
        return coinReducer(coin, coinLookup)
      })
    } else {
      fees = transaction.tx.auth_info.fee.amount.map((fee) => {
        const coinLookup = network.getCoinLookup(fee.denom)
        return coinReducer(fee, coinLookup)
      })
    }
    // We do display only the transactions we support in Lunie
    const filteredMessages = transaction.tx.body.messages.filter(
      ({ type }) => reducers.getMessageType(type) !== 'Unknown'
    )
    const { claimMessages, otherMessages } = filteredMessages.reduce(
      ({ claimMessages, otherMessages }, message) => {
        // we need to aggregate all withdraws as we display them together in one transaction
        if (
          reducers.getMessageType(message.type) ===
          lunieMessageTypes.CLAIM_REWARDS
        ) {
          claimMessages.push(message)
        } else {
          otherMessages.push(message)
        }
        return { claimMessages, otherMessages }
      },
      { claimMessages: [], otherMessages: [] }
    )

    // we need to aggregate claim rewards messages in one single one to avoid transaction repetition
    const claimMessage =
      claimMessages.length > 0
        ? reducers.claimRewardsMessagesAggregator(claimMessages)
        : undefined
    const allMessages = claimMessage
      ? otherMessages.concat(claimMessage) // add aggregated claim message
      : otherMessages
    const returnedMessages = allMessages.map(({ value, type }, index) => ({
      id: transaction.txhash,
      type: reducers.getMessageType(type),
      hash: transaction.txhash,
      networkId: network.id,
      key: `${transaction.txhash}_${index}`,
      height: transaction.height,
      details: reducers.transactionDetailsReducer(
        reducers.getMessageType(type),
        value,
        reducers,
        transaction,
        network
      ),
      timestamp: transaction.timestamp,
      memo: transaction.tx.body.memo,
      fees,
      success: reducers.setTransactionSuccess(transaction, index, network.id),
      log:
        transaction.logs && transaction.logs[index]
          ? transaction.logs[index].log
            ? transaction.logs[index].log || transaction.logs[0] // failing txs show the first logs
            : transaction.logs[0].log || ''
          : JSON.parse(JSON.stringify(transaction.raw_log)).message,
      involvedAddresses: Array.isArray(transaction.logs)
        ? uniq(
            reducers.extractInvolvedAddresses(
              transaction.logs.find(
                ({ msg_index: msgIndex }) => msgIndex === index
              ).events
            )
          )
        : [],
    }))
    return returnedMessages
  } catch (error) {
    return [] // must return something differ from undefined
  }
}

function transactionsReducerV2(network, txs, reducers) {
  const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  const reversedTxs = reverse(sortedTxs)
  // here we filter out all transactions related to validators
  return reversedTxs.reduce((collection, transaction) => {
    return collection.concat(
      transactionReducerV2(network, transaction, reducers)
    )
  }, [])
}

function delegationReducer(delegation, validator, active, network) {
  const coinLookup = network.coinLookup.find(
    ({ viewDenom }) => viewDenom === network.stakingDenom
  )
  const { amount, denom } = coinReducer(
    { amount: delegation.balance, denom: network.stakingDenom },
    coinLookup
  )

  return {
    id: delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount,
    active,
  }
}

function validatorReducer(
  network,
  signedBlocksWindow,
  validator,
  annualProvision,
  reducers
) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  return {
    id: validator.operator_address,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    details: validator.description.details,
    website: websiteURL,
    identity: validator.description.identity,
    name: validator.description.moniker,
    votingPower: validator.votingPower.toFixed(6),
    startHeight: validator.signing_info
      ? validator.signing_info.start_height
      : undefined,
    uptimePercentage:
      validator.signing_info &&
      validator.signing_info.missed_blocks_counter &&
      signedBlocksWindow
        ? 1 -
          Number(
            validator.signing_info
              ? validator.signing_info.missed_blocks_counter
              : 0
          ) /
            Number(signedBlocksWindow)
        : 1,
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: Number(validator.commission.commission_rates.rate).toFixed(6),
    maxCommission: validator.commission.commission_rates.max_rate,
    maxChangeCommission: validator.commission.commission_rates.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    popularity: validator.popularity,
    expectedReturns: reducers
      .expectedRewardsPerToken(
        validator,
        validator.commission.commission_rates.rate,
        annualProvision
      )
      .toFixed(6),
  }
}

function extractInvolvedAddresses(transaction) {
  // If the transaction has failed, it doesn't get tagged
  if (!Array.isArray(transaction.events)) return []

  // extract all addresses from events that are either sender or recipient
  const involvedAddresses = transaction.events.reduce(
    (involvedAddresses, event) => {
      const senderAttributes = event.attributes
        .filter(({ key }) => key === 'sender')
        .map((sender) => sender.value)
      if (senderAttributes.length) {
        involvedAddresses = [...involvedAddresses, ...senderAttributes]
      }

      const recipientAttribute = event.attributes.find(
        ({ key }) => key === 'recipient'
      )
      if (recipientAttribute) {
        involvedAddresses.push(recipientAttribute.value)
      }

      return involvedAddresses
    },
    []
  )
  return involvedAddresses
}

function undelegationEndTimeReducer(transaction) {
  const events = transaction.logs.reduce(
    (events, log) => (log.events ? events.concat(log.events) : events),
    []
  )

  let completionTimeAttribute
  events.find(({ attributes }) => {
    if (attributes) {
      completionTimeAttribute = attributes.find(
        (tx) => tx.key === `completion_time`
      )
    }
    return !!completionTimeAttribute
  })
  return completionTimeAttribute ? completionTimeAttribute.value : undefined
}

module.exports = {
  proposalReducer,
  networkAccountReducer,
  governanceParameterReducer,
  topVoterReducer,
  tallyReducer,
  depositReducer,
  voteReducer,
  validatorReducer,
  blockReducer,
  blockHeaderReducer,
  delegationReducer,
  coinReducer,
  gasPriceReducer,
  rewardCoinReducer,
  balanceReducer,
  balanceV2Reducer,
  undelegationReducer,
  rewardReducer,
  accountInfoReducer,
  calculateTokens,

  atoms,
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  getTotalVotePercentage,
  getValidatorStatus,
  expectedRewardsPerToken,
  denomLookup,
  extractInvolvedAddresses,
  getProposalSummary,
  undelegationEndTimeReducer,

  transactionsReducerV2,
  transactionReducerV2,
  depositDetailsReducer,
  voteProposalDetailsReducer,
  submitProposalDetailsReducer,
  claimRewardsDetailsReducer,
  stakeDetailsReducer,
  unstakeDetailsReducer,
  sendDetailsReducer,
  restakeDetailsReducer,
  setTransactionSuccess,
  transactionDetailsReducer,
  claimRewardsMessagesAggregator,
  getMessageType,
}
