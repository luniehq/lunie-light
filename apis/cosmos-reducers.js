const BigNumber = require('bignumber.js')
const { reverse, sortBy, uniq, uniqWith } = require('lodash')
const { encodeB32, decodeB32 } = require('~/common/address')
const { fixDecimalsAndRoundUp } = require('~/common/numbers.js')
const { getProposalSummary } = require('~/common/common-reducers')
const { lunieMessageTypes } = require('~/common/lunie-message-types')
const network = require('~/common/network')

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

function getStakingCoinViewAmount(chainStakeAmount) {
  return coinReducer({
    amount: chainStakeAmount,
    denom: network.stakingDenom,
  }).amount
}

function coinReducer(chainCoin) {
  const coinLookup = network.getCoinLookup(chainCoin.denom)

  if (!coinLookup) {
    return {
      supported: false,
      amount: -1,
      denom: '[NOT SUPPORTED] ' + chainCoin.denom,
    }
  }

  return {
    supported: true,
    amount: BigNumber(chainCoin.amount)
      .times(coinLookup.chainToViewConversionFactor)
      .toFixed(6),
    denom: coinLookup.viewDenom,
  }
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
// ATTENTION doesn't consider multi denom deposits
function getDeposit(proposal) {
  const sum = proposal.total_deposit
    .filter(({ denom }) => denom === network.stakingDenom)
    .reduce((sum, cur) => sum.plus(cur.amount), BigNumber(0))
  return getStakingCoinViewAmount(sum)
}

function getTotalVotePercentage(proposal, totalBondedTokens, totalVoted) {
  // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
  if (proposalFinalized(proposal)) return -1
  if (BigNumber(totalVoted).eq(0)) return 0
  if (!totalBondedTokens) return -1
  return Number(
    BigNumber(totalVoted)
      .div(getStakingCoinViewAmount(totalBondedTokens))
      .toNumber()
      .toFixed(6)
  )
}

function tallyReducer(proposal, tally, totalBondedTokens) {
  // if the proposal is out of voting, use the final result for the tally
  if (proposalFinalized(proposal)) {
    tally = proposal.final_tally_result
  }

  const totalVoted = getStakingCoinViewAmount(
    BigNumber(tally.yes)
      .plus(tally.no)
      .plus(tally.abstain)
      .plus(tally.no_with_veto)
  )

  return {
    yes: getStakingCoinViewAmount(tally.yes),
    no: getStakingCoinViewAmount(tally.no),
    abstain: getStakingCoinViewAmount(tally.abstain),
    veto: getStakingCoinViewAmount(tally.no_with_veto),
    total: totalVoted,
    totalVotedPercentage: getTotalVotePercentage(
      proposal,
      totalBondedTokens,
      totalVoted
    ),
  }
}

function depositReducer(deposit, validators) {
  return {
    id: deposit.depositor,
    amount: deposit.amount.map(coinReducer),
    depositer: networkAccountReducer(deposit.depositor, validators),
  }
}

function voteReducer(vote, validators) {
  return {
    id: String(vote.proposal_id.concat(`_${vote.voter}`)),
    voter: networkAccountReducer(vote.voter, validators),
    option: vote.option,
  }
}

function networkAccountReducer(address, validators) {
  const proposerValAddress = address
    ? encodeB32(decodeB32(address), network.validatorAddressPrefix, `hex`)
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

function governanceParameterReducer(depositParameters, tallyingParamers) {
  // for now assuming one deposit denom
  const minDeposit = coinReducer(depositParameters.min_deposit[0])
  return {
    votingThreshold: tallyingParamers.threshold,
    vetoThreshold: tallyingParamers.veto,
    depositDenom: minDeposit.denom,
    depositThreshold: minDeposit.amount,
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

function blockReducer(block) {
  return {
    id: block.block_meta.block_id.hash,
    height: block.block_meta.header.height,
    chainId: block.block_meta.header.chain_id,
    hash: block.block_meta.block_id.hash,
    time: block.block_meta.header.time,
    proposer_address: block.block_meta.header.proposer_address,
  }
}

// delegations rewards in Tendermint are located in events as strings with this form:
// amount: {"15000umuon"}, or in multidenom networks they look like this:
// amount: {"15000ungm,100000uchf,110000ueur,2000000ujpy"}
// That is why we need this separate function to extract those amounts in this format
function rewardCoinReducer(reward) {
  const multiDenomRewardsArray = reward.split(`,`)
  const mappedMultiDenomRewardsArray = multiDenomRewardsArray.map((reward) => {
    const rewardDenom = reward.match(/[a-z]+/gi)[0]
    const rewardAmount = reward.match(/[0-9]+/gi)
    return coinReducer({
      amount: rewardAmount,
      denom: rewardDenom,
    })
  })
  return mappedMultiDenomRewardsArray
}

function balanceReducer(lunieCoin, delegations, undelegations) {
  const isStakingDenom = lunieCoin.denom === network.stakingDenom
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
  return {
    id: lunieCoin.denom,
    type: isStakingDenom ? 'STAKE' : 'CURRENCY',
    total,
    denom: lunieCoin.denom,
    available: lunieCoin.amount,
    staked: delegatedStake.amount || 0,
  }
}

function undelegationReducer(undelegation, validator) {
  return {
    id: `${validator.operatorAddress}_${undelegation.creation_height}`,
    delegatorAddress: undelegation.delegator_address,
    validator,
    amount: getStakingCoinViewAmount(undelegation.balance),
    startHeight: undelegation.creation_height,
    endTime: undelegation.completion_time,
  }
}

async function reduceFormattedRewards(
  reward,
  validator,
  multiDenomRewardsArray
) {
  await Promise.all(
    reward.map((denomReward) => {
      const lunieCoin = coinReducer(denomReward)
      if (lunieCoin.amount < 0.000001) return

      multiDenomRewardsArray.push({
        id: `${validator.operatorAddress}_${lunieCoin.denom}`,
        denom: lunieCoin.denom,
        amount: fixDecimalsAndRoundUp(lunieCoin.amount, 6).toString(), // TODO: refactor using a decimals number from coinLookup
        validator,
      })
    })
  )
}

async function rewardReducer(rewards, validatorsDictionary) {
  const formattedRewards = rewards.map((reward) => ({
    reward: reward.reward,
    validator: validatorsDictionary[reward.validator_address],
  }))
  const multiDenomRewardsArray = []
  await Promise.all(
    formattedRewards.map(({ reward, validator }) =>
      reduceFormattedRewards(reward, validator, multiDenomRewardsArray)
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

function sendDetailsReducer(message) {
  return {
    from: [message.from_address],
    to: [message.to_address],
    amount: message.amount.map(coinReducer),
  }
}

function stakeDetailsReducer(message) {
  return {
    to: [message.validator_address],
    amount: coinReducer(message.amount),
  }
}

function restakeDetailsReducer(message) {
  return {
    from: [message.validator_src_address],
    to: [message.validator_dst_address],
    amount: coinReducer(message.amount),
  }
}

function unstakeDetailsReducer(message) {
  return {
    from: [message.validator_address],
    amount: coinReducer(message.amount),
  }
}

function claimRewardsDetailsReducer(message, transaction) {
  return {
    from: message.validators,
    amounts: claimRewardsAmountReducer(transaction),
  }
}

function claimRewardsAmountReducer(transaction) {
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
    .map((rewardValue) => rewardCoinReducer(rewardValue))
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

function submitProposalDetailsReducer(message) {
  return {
    proposalType: message.content.type,
    proposalTitle: message.content.value.title,
    proposalDescription: message.content.value.description,
    initialDeposit: coinReducer(message.initial_deposit[0]),
  }
}

function voteProposalDetailsReducer(message) {
  return {
    proposalId: message.proposal_id,
    voteOption: message.option,
  }
}

function depositDetailsReducer(message) {
  return {
    proposalId: message.proposal_id,
    amount: coinReducer(message.amount[0]),
  }
}

// function to map cosmos messages to our details format
function transactionDetailsReducer(type, message, transaction) {
  let details
  switch (type) {
    case lunieMessageTypes.SEND:
      details = sendDetailsReducer(message)
      break
    case lunieMessageTypes.STAKE:
      details = stakeDetailsReducer(message)
      break
    case lunieMessageTypes.RESTAKE:
      details = restakeDetailsReducer(message)
      break
    case lunieMessageTypes.UNSTAKE:
      details = unstakeDetailsReducer(message)
      break
    case lunieMessageTypes.CLAIM_REWARDS:
      details = claimRewardsDetailsReducer(message, transaction)
      break
    case lunieMessageTypes.SUBMIT_PROPOSAL:
      details = submitProposalDetailsReducer(message)
      break
    case lunieMessageTypes.VOTE:
      details = voteProposalDetailsReducer(message)
      break
    case lunieMessageTypes.DEPOSIT:
      details = depositDetailsReducer(message)
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
    type: `xxx/MsgWithdrawDelegationReward`, // prefix omited as not important
    value: {
      validators: onlyValidatorsAddressesArray,
    },
  }
}

function proposalReducer(
  proposal,
  tally,
  proposer,
  totalBondedTokens,
  detailedVotes,
  validators
) {
  return {
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
    deposit: getDeposit(proposal),
    proposer: proposer
      ? networkAccountReducer(proposer.proposer, validators)
      : undefined,
    summary: getProposalSummary(
      proposalTypeEnumDictionary[proposal.content.type.split('/')[1]]
    ),
    detailedVotes,
  }
}

function getTransactionLogs(transaction, index) {
  if (!transaction.logs || !transaction.logs[index]) {
    return JSON.parse(JSON.stringify(transaction.raw_log)).message
  }
  const logs = transaction.logs[index]
  return logs[index].log
    ? logs[index].log || logs[0] // failing txs show the first logs
    : logs[0].log || ''
}

function transactionReducer(transaction, reducers) {
  try {
    let fees
    if (transaction.tx.value) {
      fees = transaction.tx.value.fee.amount.map((coin) => {
        return coinReducer(coin)
      })
    } else {
      fees = transaction.tx.auth_info.fee.amount.map((fee) => {
        return coinReducer(fee)
      })
    }
    // We do display only the transactions we support in Lunie
    const filteredMessages = transaction.tx.value.msg.filter(
      ({ type }) => getMessageType(type) !== 'Unknown'
    )
    const { claimMessages, otherMessages } = filteredMessages.reduce(
      ({ claimMessages, otherMessages }, message) => {
        // we need to aggregate all withdraws as we display them together in one transaction
        if (getMessageType(message.type) === lunieMessageTypes.CLAIM_REWARDS) {
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
        ? claimRewardsMessagesAggregator(claimMessages)
        : undefined
    const allMessages = claimMessage
      ? otherMessages.concat(claimMessage) // add aggregated claim message
      : otherMessages
    const returnedMessages = allMessages.map(
      ({ value, type }, messageIndex) => ({
        id: transaction.txhash,
        type: getMessageType(type),
        hash: transaction.txhash,
        key: `${transaction.txhash}_${messageIndex}`,
        height: transaction.height,
        details: transactionDetailsReducer(
          getMessageType(type),
          value,
          transaction
        ),
        timestamp: transaction.timestamp,
        memo: transaction.tx.value.memo,
        fees,
        success: setTransactionSuccess(transaction, messageIndex),
        log: getTransactionLogs(transaction, messageIndex),
        involvedAddresses: Array.isArray(transaction.logs)
          ? extractInvolvedAddresses(
              // TODO check
              transaction.logs.find(
                ({ msg_index: msgIndex }) => msgIndex === messageIndex
              ).events
            )
          : [],
      })
    )
    return returnedMessages
  } catch (error) {
    return [] // must return something differ from undefined
  }
}
function transactionsReducer(txs, reducers) {
  const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  const reversedTxs = reverse(sortedTxs)
  // here we filter out all transactions related to validators
  return reversedTxs.reduce((collection, transaction) => {
    return collection.concat(transactionReducer(transaction, reducers))
  }, [])
}

function delegationReducer(delegation, validator, active) {
  const { amount, denom } = coinReducer({
    amount: delegation.balance,
    denom: network.stakingDenom,
  })

  return {
    id: delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount,
    active,
  }
}

function getValidatorUptimePercentage(validator, signedBlocksWindow) {
  if (
    validator.signing_info &&
    validator.signing_info.missed_blocks_counter &&
    signedBlocksWindow
  ) {
    return (
      1 -
      Number(validator.signing_info.missed_blocks_counter) /
        Number(signedBlocksWindow)
    )
  } else {
    return 1
  }
}

function validatorReducer(
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
    uptimePercentage: getValidatorUptimePercentage(
      validator,
      signedBlocksWindow
    ),
    tokens: getStakingCoinViewAmount(validator.tokens),
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

function extractInvolvedAddresses(messageEvents) {
  // If the transaction has failed, it doesn't get tagged
  if (!Array.isArray(messageEvents)) return []

  // extract all addresses from events that are either sender or recipient
  const involvedAddresses = messageEvents.reduce((involvedAddresses, event) => {
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
  }, [])
  return uniq(involvedAddresses)
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
  delegationReducer,
  coinReducer,
  rewardCoinReducer,
  balanceReducer,
  undelegationReducer,
  rewardReducer,
  accountInfoReducer,

  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  getTotalVotePercentage,
  getValidatorStatus,
  expectedRewardsPerToken,
  extractInvolvedAddresses,
  getProposalSummary,
  undelegationEndTimeReducer,

  transactionsReducer,
  transactionReducer,
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