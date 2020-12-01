import BigNumber from 'bignumber.js'
import { keyBy, orderBy, take, reverse, sortBy, chunk } from 'lodash'
import * as reducers from './cosmos-reducers'
import { encodeB32, decodeB32, pubkeyToAddress } from '~/common/address'
import { setDecimalLength } from '~/common/numbers'
import network from '~/common/network'

const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }
const PAGE_RECORDS_COUNT = 20
const GOLANG_NULL_TIME = `0001-01-01T00:00:00Z` // time that gets serialized from null in golang

export default class CosmosAPI {
  constructor(axios) {
    this.axios = axios // passed in here to use Nuxt $axios instance
    this.network = network
    this.reducers = reducers

    // system to stop queries to proceed if store data is not yet available
    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })

    this.loadValidators().then((validators) => {
      this.validators = keyBy(validators, 'operatorAddress')
      this.resolveReady()
    })
  }

  async get(url) {
    return await this.axios(
      network.apiURL + (url.startsWith('/') ? url : '/' + url)
    ).then((res) => res.data)
  }

  // querying data from the cosmos REST API
  // some endpoints /blocks and /txs have a different response format so they use this.get directly
  async query(url, resultSelector = 'result') {
    try {
      const response = await this.get(url)
      return response[resultSelector]
    } catch (error) {
      console.error(
        `Error for query ${url} in network ${this.network.name} (tried 3 times)`
      )
      throw error
    }
  }

  async getAccountInfo(address) {
    const accountInfo = await this.query(`/auth/accounts/${address}`)
    return {
      accountNumber: accountInfo.value.account_number,
      sequence: accountInfo.value.sequence || '0',
    }
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query('/slashing/parameters')
    return slashingParams.signed_blocks_window
  }

  async getTransactions(address, pageNumber = 0) {
    // getting page count
    const [senderPage, recipientPage] = await Promise.all([
      this.getPageCount(`/txs?message.sender=${address}`),
      this.getPageCount(`/txs?transfer.recipient=${address}`),
    ])

    const requests = [
      this.loadPaginatedTxs(
        `/txs?message.sender=${address}`,
        senderPage - pageNumber
      ),
      this.loadPaginatedTxs(
        `/txs?transfer.recipient=${address}`,
        recipientPage - pageNumber
      ),
    ]
    /*
      if it's a first requests we need to load two pages, instead of one,
      cause last page could contain less records than any other (even 1)
      To do this asynchronously we need to do it with Promise.all
      and not wait until last page is loaded
    */
    if (!pageNumber) {
      if (senderPage - pageNumber > 1) {
        requests.push(
          this.loadPaginatedTxs(
            `/txs?message.sender=${address}`,
            senderPage - pageNumber - 1
          )
        )
      }
      if (recipientPage - pageNumber > 1) {
        requests.push(
          this.loadPaginatedTxs(
            `/txs?transfer.recipient=${address}`,
            recipientPage - pageNumber - 1
          )
        )
      }
    }

    const txs = await Promise.all(requests).then(([...results]) =>
      [].concat(...results)
    )

    return this.reducers.transactionsReducer(txs)
  }

  async getValidatorSigningInfos() {
    const signingInfos = await this.query(`slashing/signing_infos`)
    return signingInfos
  }

  async getValidatorSet(height = 'latest') {
    const response = await this.query(`validatorsets/${height}`)
    return response
  }

  async getSelfStake(validator) {
    const hexDelegatorAddressFromOperator = decodeB32(validator.operatorAddress)
    const delegatorAddressFromOperator = encodeB32(
      hexDelegatorAddressFromOperator,
      this.network.addressPrefix
    )

    let selfDelegation
    try {
      selfDelegation = await this.query(
        `staking/delegators/${delegatorAddressFromOperator}/delegations/${validator.operatorAddress}`
      )
    } catch (error) {
      // in some rare cases the validator has no self delegation so this query fails

      if (error.response.status === 500) {
        const parsedErrorLog = JSON.parse(error.response.body.error)
        if (parsedErrorLog.message.startsWith('no delegation for this')) {
          return 0
        }
      }

      // still throw in every other unknown case
      throw error
    }

    return this.reducers.delegationReducer(
      selfDelegation,
      validator,
      delegationEnum.ACTIVE
    ).amount
  }

  async getValidator(address) {
    await this.dataReady
    return this.validators[address]
  }

  async getValidators() {
    await this.dataReady
    return Object.values(this.validators)
  }

  async loadValidators(height) {
    const [
      validators,
      annualProvision,
      validatorSet,
      signedBlocksWindow,
    ] = await Promise.all([
      Promise.all([
        this.query(`staking/validators?status=unbonding`),
        this.query(`staking/validators?status=bonded`),
        this.query(`staking/validators?status=unbonded`),
      ]).then((validatorGroups) => [].concat(...validatorGroups)),
      this.getAnnualProvision().catch(() => undefined),
      this.getValidatorSet(height),
      this.getSignedBlockWindow(),
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = keyBy(validatorSet.validators, 'address')
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { voting_power: votingPower }) => sum.plus(votingPower),
      BigNumber(0)
    )

    // query for signing info
    const signingInfos = keyBy(
      await this.getValidatorSigningInfos(validators),
      'address'
    )

    validators.forEach((validator) => {
      const consensusAddress = pubkeyToAddress(
        validator.consensus_pubkey,
        network.validatorConsensusaddressPrefix
      )
      validator.votingPower = consensusValidators[consensusAddress]
        ? BigNumber(consensusValidators[consensusAddress].voting_power)
            .div(totalVotingPower)
            .toNumber()
        : 0
      validator.signing_info = signingInfos[consensusAddress]
    })

    return validators.map((validator) =>
      this.reducers.validatorReducer(
        signedBlocksWindow,
        validator,
        annualProvision
      )
    )
  }

  async getDetailedVotes(proposal) {
    await this.dataReady
    const [
      votes,
      deposits,
      tally,
      tallyingParameters,
      depositParameters,
    ] = await Promise.all([
      this.query(`/gov/proposals/${proposal.id}/votes`),
      this.query(`/gov/proposals/${proposal.id}/deposits`),
      this.query(`/gov/proposals/${proposal.id}/tally`),
      this.query(`/gov/parameters/tallying`),
      this.query(`/gov/parameters/deposit`),
    ])
    const totalVotingParticipation = BigNumber(tally.yes)
      .plus(tally.abstain)
      .plus(tally.no)
      .plus(tally.no_with_veto)
    const formattedDeposits = deposits
      ? deposits.map((deposit) =>
          this.reducers.depositReducer(deposit, this.validators)
        )
      : undefined
    const depositsSum = formattedDeposits
      ? formattedDeposits.reduce((depositAmountAggregator, deposit) => {
          return (depositAmountAggregator += Number(deposit.amount[0].amount))
        }, 0)
      : undefined
    return {
      deposits: formattedDeposits,
      depositsSum: deposits ? Number(depositsSum).toFixed(6) : undefined,
      percentageDepositsNeeded: deposits
        ? percentage(
            depositsSum,
            BigNumber(depositParameters.min_deposit[0].amount)
          )
        : undefined,
      votes: votes
        ? votes.map((vote) => this.reducers.voteReducer(vote, this.validators))
        : undefined,
      votesSum: votes ? votes.length : undefined,
      votingThresholdYes: Number(tallyingParameters.threshold).toFixed(2),
      votingThresholdNo: (1 - tallyingParameters.threshold).toFixed(2),
      votingPercentageYes: percentage(tally.yes, totalVotingParticipation),
      votingPercentageNo: percentage(
        BigNumber(tally.no).plus(tally.no_with_veto),
        totalVotingParticipation
      ),
      timeline: [
        proposal.submit_time
          ? { title: `Created`, time: proposal.submit_time }
          : undefined,
        proposal.deposit_end_time
          ? {
              title: `Deposit Period Ends`,
              // the deposit period can end before the time as the limit is reached already
              time:
                proposal.voting_start_time !== GOLANG_NULL_TIME &&
                new Date(proposal.voting_start_time) <
                  new Date(proposal.deposit_end_time)
                  ? proposal.voting_start_time
                  : proposal.deposit_end_time,
            }
          : undefined,
        proposal.voting_start_time
          ? {
              title: `Voting Period Starts`,
              time:
                proposal.voting_start_time !== GOLANG_NULL_TIME
                  ? proposal.voting_start_time
                  : undefined,
            }
          : undefined,
        proposal.voting_end_time
          ? {
              title: `Voting Period Ends`,
              time:
                proposal.voting_end_time !== GOLANG_NULL_TIME
                  ? proposal.voting_end_time
                  : undefined,
            }
          : undefined,
      ].filter((x) => !!x),
    }
  }

  // we can't query the proposer of blocks from past chains
  async getProposer(proposal, firstBlock) {
    let proposer = { proposer: undefined }
    const proposalIsFromPastChain =
      proposal.voting_end_time !== GOLANG_NULL_TIME &&
      new Date(firstBlock.time) > new Date(proposal.voting_end_time)
    if (!proposalIsFromPastChain) {
      proposer = await this.query(`gov/proposals/${proposal.id}/proposer`)
    }
    return proposer
  }

  async getProposalMetaData(proposal, firstBlock) {
    const [tally, detailedVotes, proposer] = await Promise.all([
      this.query(`gov/proposals/${proposal.id}/tally`),
      this.getDetailedVotes(proposal),
      this.getProposer(proposal, firstBlock),
    ])
    return [tally, detailedVotes, proposer]
  }

  async getProposals() {
    await this.dataReady
    const [
      proposalsResponse,
      firstBlock,
      { bonded_tokens: totalBondedTokens },
    ] = await Promise.all([
      this.query('gov/proposals'),
      this.getBlock(1),
      this.query('/staking/pool'),
    ])
    if (!Array.isArray(proposalsResponse)) return []
    const proposals = await Promise.all(
      proposalsResponse.map(async (proposal) => {
        const [tally, detailedVotes, proposer] = await this.getProposalMetaData(
          proposal,
          firstBlock
        )
        return this.reducers.proposalReducer(
          proposal,
          tally,
          proposer,
          totalBondedTokens,
          detailedVotes,
          this.validators
        )
      })
    )

    return orderBy(proposals, 'id', 'desc')
  }

  async getProposal(proposalId) {
    await this.dataReady
    const [
      proposal,
      { bonded_tokens: totalBondedTokens },
      firstBlock,
    ] = await Promise.all([
      this.query(`gov/proposals/${proposalId}`).catch(() => {
        throw new Error(
          `There is no proposal in the network with ID '${proposalId}'`
        )
      }),
      this.query(`/staking/pool`),
      this.getBlock(1),
    ])
    const [tally, detailedVotes, proposer] = await this.getProposalMetaData(
      proposal,
      firstBlock
    )
    return this.reducers.proposalReducer(
      proposal,
      tally,
      proposer,
      totalBondedTokens,
      detailedVotes,
      this.validators
    )
  }

  async getTopVoters() {
    await this.dataReady
    // for now defaulting to pick the 10 largest voting powers
    return take(
      reverse(
        sortBy(this.validators, [
          (validator) => {
            return validator.votingPower
          },
        ])
      ),
      10
    )
  }

  async getGovernanceOverview() {
    const { bonded_tokens: totalBondedTokens } = await this.query(
      '/staking/pool'
    )
    const [communityPoolArray, topVoters] = await Promise.all([
      this.query('/distribution/community_pool'),
      this.getTopVoters(),
    ])
    const stakingChainDenom = this.network.getCoinLookup(
      this.network.stakingDenom,
      'viewDenom'
    ).chainDenom
    const communityPool = communityPoolArray.find(
      ({ denom }) => denom === stakingChainDenom
    ).amount
    return {
      totalStakedAssets: setDecimalLength(
        reducers.getStakingCoinViewAmount(totalBondedTokens),
        2
      ),
      totalVoters: undefined,
      treasurySize: setDecimalLength(
        reducers.getStakingCoinViewAmount(communityPool),
        2
      ),
      topVoters: topVoters.map((topVoter) =>
        this.reducers.topVoterReducer(topVoter)
      ),
    }
  }

  async getDelegatorVote({ proposalId, address }) {
    const response = await this.query(`gov/proposals/${proposalId}/votes`)
    const votes = response || []
    const vote = votes.find(({ voter }) => voter === address) || {}
    return {
      option: vote.option,
    }
  }

  async getBlock(blockHeight) {
    let block
    if (blockHeight) {
      block = await this.get(`blocks/${blockHeight}`)
    } else {
      block = await this.get(`blocks/latest`)
    }
    return this.reducers.blockReducer(block)
  }

  async getBalances(address) {
    const [balancesResponse, delegations, undelegations] = await Promise.all([
      this.query(`bank/balances/${address}`),
      this.getDelegationsForDelegator(address),
      this.getUndelegationsForDelegator(address),
    ])
    const balances = balancesResponse || []
    const coins = await Promise.all(
      balances.map(async (balance) => {
        let ibcInfo
        if (balance.denom.startsWith('ibc/')) {
          ibcInfo = await this.getIbcInfo(balance.denom)
        }
        return this.reducers.coinReducer(balance, ibcInfo)
      })
    )
    // also check if there are any denoms as rewards the user has not as a balance
    // we need to show those as well in the balance overview as we show the rewards there
    const rewards = await this.getRewards(address)
    const rewardsBalances = rewards.reduce((coinsAggregator, reward) => {
      if (
        !coins.find((coin) => coin.denom === reward.denom) &&
        !coinsAggregator.find((coin) => coin.denom === reward.denom)
      ) {
        coinsAggregator.push({
          amount: 0,
          denom: reward.denom,
        })
      }
      return coinsAggregator
    }, [])
    // join regular balances and rewards balances
    coins.push(...rewardsBalances)

    // the user might not have liquid staking tokens but have staking tokens delegated
    // if we don't add the staking denom, we would show a 0 total for the staking denom which is wrong
    const hasStakingDenom = coins.find(
      ({ denom }) => denom === this.network.stakingDenom
    )
    if (!hasStakingDenom) {
      coins.push({
        amount: BigNumber(0),
        denom: this.network.stakingDenom,
      })
    }
    return coins.map((coin) => {
      return this.reducers.balanceReducer(coin, delegations, undelegations)
    })
  }

  async getIbcInfo(traceId) {
    if (traceId.startsWith('ibc/')) {
      traceId = traceId.split(`/`)[1]
    }
    const result = await this.get(
      `/ibc_transfer/v1beta1/denom_traces/${traceId}`
    )
    const trace = result.denom_trace
    const chainTrace = await Promise.all(
      chunk(trace.path.split('/'), 2).map(async ([port, channel]) => {
        const result = await this.get(
          `/ibc/channel/v1beta1/channels/${channel}/ports/${port}/client_state`
        )
        return result.identified_client_state.client_state.chain_id
      })
    )
    return {
      denom: trace.base_denom,
      chainTrace,
    }
  }

  async getDelegationsForDelegator(address) {
    await this.dataReady
    const delegations =
      (await this.query(`staking/delegators/${address}/delegations`)) || []
    return delegations
      .map((delegation) =>
        this.reducers.delegationReducer(
          delegation,
          this.validators[delegation.delegation.validator_address],
          delegationEnum.ACTIVE
        )
      )
      .filter((delegation) => BigNumber(delegation.amount).gt(0))
  }

  async getUndelegationsForDelegator(address) {
    await this.dataReady
    const undelegations =
      (await this.query(
        `staking/delegators/${address}/unbonding_delegations`
      )) || []

    // undelegations come in a nested format { validator_address, delegator_address, entries }
    // we flatten the format to be able to easier iterate over the list
    const flattenedUndelegations = undelegations.reduce(
      (list, undelegation) =>
        list.concat(
          undelegation.entries.map((entry) => ({
            validator_address: undelegation.validator_address,
            delegator_address: undelegation.delegator_address,
            balance: entry.balance,
            completion_time: entry.completion_time,
            creation_height: entry.creation_height,
            initial_balance: entry.initial_balance,
          }))
        ),
      []
    )
    return flattenedUndelegations.map((undelegation) =>
      this.reducers.undelegationReducer(
        undelegation,
        this.validators[undelegation.validator_address]
      )
    )
  }

  async getValidatorDelegations(validator) {
    const delegations = await this.query(
      `staking/validators/${validator.operatorAddress}/delegations`
    ).catch(() => {
      return []
    })

    return delegations.map((delegation) =>
      this.reducers.delegationReducer(
        delegation,
        validator,
        delegationEnum.ACTIVE
      )
    )
  }

  async getAnnualProvision() {
    const response = await this.query(`minting/annual-provisions`)
    return response
  }

  async getRewards(delegatorAddress) {
    await this.dataReady
    const result = await this.query(
      `distribution/delegators/${delegatorAddress}/rewards`
    )
    const rewards = (result.rewards || []).filter(
      ({ reward }) => reward && reward.length > 0
    )
    return await this.reducers.rewardReducer(rewards, this.validators)
  }

  async loadPaginatedTxs(url, page = 1) {
    if (page < 1) {
      return []
    }
    const pagination = `&limit=${PAGE_RECORDS_COUNT}&page=${page}`
    const { txs } = await this.get(`${url}${pagination}`)
    return txs || []
  }

  async getPageCount(url) {
    const page = await this.get(url + `&limit=${PAGE_RECORDS_COUNT}`)
    return page.page_total
  }
}

function percentage(x, total) {
  // percentage output should always be a number between 0 and 1
  return total.toNumber() > 0
    ? BigNumber(x).div(total).toNumber().toFixed(4)
    : 0
}
