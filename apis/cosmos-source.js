const BigNumber = require('bignumber.js')
const { keyBy, orderBy, take, reverse, sortBy, uniqBy } = require('lodash')
const { encodeB32, decodeB32, pubkeyToAddress } = require('../common/address')
const { fixDecimalsAndRoundUpBigNumbers } = require('../common/numbers.js')

const delegationEnum = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }
const PAGE_RECORDS_COUNT = 20

class CosmosAPI {
  constructor(axios, network, store, fiatValuesAPI, db) {
    this.baseURL = network.apiURL
    this.axios = axios
    this.network = network
    this.networkId = network.id
    this.delegatorBech32Prefix = network.addressPrefix
    this.validatorConsensusBech32Prefix = `${network.addressPrefix}valcons`
    this.store = store // TODO remove store
    this.fiatValuesAPI = fiatValuesAPI
    this.db = db

    // system to stop queries to proceed if store data is not yet available
    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })

    this.setReducers()
    this.loadValidators().then((validators) => {
      this.store.validators = keyBy(validators, 'operatorAddress')
      this.resolveReady()
    })
  }

  setReducers() {
    this.reducers = require('./cosmos-reducers')
  }

  // hacky way to get error text
  async getError(url) {
    try {
      return await this.axios(
        this.baseURL + (url.startsWith('/') ? url : '/' + url)
      )
    } catch (error) {
      return error.response.body.error
    }
  }

  async get(url) {
    return await this.axios(
      this.baseURL + (url.startsWith('/') ? url : '/' + url)
    ).then((res) => res.data)
  }

  // querying data from the cosmos REST API
  // is overwritten in cosmos v2 to extract from a differnt result format
  // some endpoints /blocks and /txs have a different response format so they use this.get directly
  async query(url, resultSelector = 'result') {
    try {
      const response = await this.get(url)
      return response[resultSelector]
    } catch (error) {
      console.error(
        `Error for query ${url} in network ${this.networkId} (tried 3 times)`
      )
      throw error
    }
  }

  async getSignedBlockWindow() {
    const slashingParams = await this.query('/slashing/parameters')
    return slashingParams.signed_blocks_window
  }

  checkAddress(address) {
    if (!address.startsWith(this.delegatorBech32Prefix)) {
      throw new Error(
        `The address you entered doesn't belong to the ${this.network.title} network`
      )
    }
  }

  async getTransactionsV2ByHeight(height) {
    const txs = await this.loadPaginatedTxs(`txs?tx.height=${height}`)
    return Array.isArray(txs)
      ? this.reducers.transactionsReducerV2(
          this.network,
          txs,
          this.reducers,
          this.network.stakingDenom
        )
      : []
  }

  async getTransactionsV2(address, pageNumber = 0) {
    this.checkAddress(address)

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

    return this.reducers.transactionsReducerV2(this.network, txs, this.reducers)
  }

  async getValidatorSigningInfos() {
    const signingInfos = await this.query(`slashing/signing_infos`)
    return signingInfos
  }

  async getValidatorSigningInfo(validatorConsensusPubKey) {
    const response = await this.query(
      `slashing/validators/${validatorConsensusPubKey}/signing_info`
    )
    return {
      address: pubkeyToAddress(
        validatorConsensusPubKey,
        this.validatorConsensusBech32Prefix
      ),
      ...response,
    }
  }

  async getAllValidatorSets(height = 'latest') {
    const response = await this.query(`validatorsets/${height}`)
    return response
  }

  async getSelfStake(validator) {
    const hexDelegatorAddressFromOperator = decodeB32(validator.operatorAddress)
    const delegatorAddressFromOperator = encodeB32(
      hexDelegatorAddressFromOperator,
      this.delegatorBech32Prefix
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
      delegationEnum.ACTIVE,
      this.network
    ).amount
  }

  async getValidator(address) {
    const [
      validator,
      annualProvision,
      validatorSet,
      signedBlocksWindow,
    ] = await Promise.all([
      this.query(`staking/validators/${address}`),
      this.getAnnualProvision(),
      this.getAllValidatorSets(),
      this.getSignedBlockWindow(),
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = keyBy(validatorSet.validators, 'address')
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { votingPower }) => sum.plus(votingPower),
      BigNumber(0)
    )

    // query for signing info
    const signingInfos = keyBy(
      await this.getValidatorSigningInfos([validator]),
      'address'
    )

    const consensusAddress = pubkeyToAddress(
      validator.consensus_pubkey,
      this.validatorConsensusBech32Prefix
    )
    validator.votingPower = consensusValidators[consensusAddress]
      ? BigNumber(consensusValidators[consensusAddress].votingPower)
          .div(totalVotingPower)
          .toNumber()
      : 0
    validator.signing_info = signingInfos[consensusAddress]

    return this.reducers.validatorReducer(
      this.network,
      signedBlocksWindow,
      validator,
      annualProvision,
      this.reducers
    )
  }

  async getAllValidators() {
    await this.dataReady
    return Object.values(this.store.validators)
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
      this.getAnnualProvision(),
      this.getAllValidatorSets(height),
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
        this.validatorConsensusBech32Prefix
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
        this.network,
        signedBlocksWindow,
        validator,
        annualProvision,
        this.reducers
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
      links,
    ] = await Promise.all([
      this.query(`/gov/proposals/${proposal.id}/votes`),
      this.query(`/gov/proposals/${proposal.id}/deposits`),
      this.query(`/gov/proposals/${proposal.id}/tally`),
      this.query(`/gov/parameters/tallying`),
      this.query(`/gov/parameters/deposit`),
      this.db.getNetworkLinks(this.network.id),
    ])
    const totalVotingParticipation = BigNumber(tally.yes)
      .plus(tally.abstain)
      .plus(tally.no)
      .plus(tally.no_with_veto)
    const formattedDeposits = deposits
      ? deposits.map((deposit) =>
          this.reducers.depositReducer(deposit, this.network, this.store)
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
        ? (
            (depositsSum * 100) /
            fixDecimalsAndRoundUpBigNumbers(
              depositParameters.min_deposit[0].amount,
              6,
              this.network
            )
          ).toFixed(2)
        : undefined,
      votes: votes
        ? votes.map((vote) => this.reducers.voteReducer(vote, this.store))
        : undefined,
      votesSum: votes ? votes.length : undefined,
      votingThresholdYes: Number(tallyingParameters.threshold).toFixed(2),
      votingThresholdNo: (1 - tallyingParameters.threshold).toFixed(2),
      votingPercentageYes:
        totalVotingParticipation.toNumber() > 0
          ? BigNumber(tally.yes)
              .times(100)
              .div(totalVotingParticipation)
              .toNumber()
              .toFixed(2)
          : 0,
      votingPercentageNo:
        totalVotingParticipation.toNumber() > 0
          ? BigNumber(tally.no)
              .plus(tally.no_with_veto)
              .times(100)
              .div(totalVotingParticipation)
              .toNumber()
              .toFixed(2)
          : 0,
      links,
      timeline: [
        proposal.submit_time
          ? { title: `Created`, time: proposal.submit_time }
          : undefined,
        proposal.deposit_end_time
          ? {
              title: `Deposit Period Ends`,
              // the deposit period can end before the time as the limit is reached already
              time:
                proposal.voting_start_time !== `0001-01-01T00:00:00Z` &&
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
                proposal.voting_start_time !== `0001-01-01T00:00:00Z`
                  ? proposal.voting_start_time
                  : undefined,
            }
          : undefined,
        proposal.voting_end_time
          ? {
              title: `Voting Period Ends`,
              time:
                proposal.voting_end_time !== `0001-01-01T00:00:00Z`
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
      proposal.voting_end_time !== `0001-01-01T00:00:00Z` &&
      new Date(firstBlock.time) > new Date(proposal.voting_end_time)
    if (!proposalIsFromPastChain) {
      proposer = await this.query(`gov/proposals/${proposal.id}/proposer`)
    }
    return proposer
  }

  async getProposal(proposal, totalBondedTokens, validators, firstBlock) {
    const [tally, detailedVotes] = await Promise.all([
      this.query(`gov/proposals/${proposal.id}/tally`),
      this.getDetailedVotes(proposal),
    ])
    const proposer = await this.getProposer(proposal, firstBlock)
    return this.reducers.proposalReducer(
      this.network.id,
      proposal,
      tally,
      proposer,
      totalBondedTokens,
      detailedVotes,
      this.reducers,
      validators
    )
  }

  async getAllProposals(validators) {
    const [
      proposalsResponse,
      firstBlock,
      { bonded_tokens: totalBondedTokens },
    ] = await Promise.all([
      this.query('gov/proposals'),
      this.getBlockByHeightV2(1),
      this.query('/staking/pool'),
    ])
    if (!Array.isArray(proposalsResponse)) return []
    const proposals = await Promise.all(
      proposalsResponse.map(async (proposal) => {
        return await this.getProposal(
          proposal,
          totalBondedTokens,
          validators,
          firstBlock
        )
      })
    )

    return orderBy(proposals, 'id', 'desc')
  }

  async getProposalById(proposalId, validators) {
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
      this.getBlockByHeightV2(1),
    ])
    return this.getProposal(proposal, totalBondedTokens, validators, firstBlock)
  }

  async getGovernanceParameters() {
    const depositParameters = await this.query(`gov/parameters/deposit`)
    const tallyingParamers = await this.query(`gov/parameters/tallying`)

    return this.reducers.governanceParameterReducer(
      depositParameters,
      tallyingParamers,
      this.network
    )
  }

  async getTopVoters() {
    await this.dataReady
    // for now defaulting to pick the 10 largest voting powers
    return take(
      reverse(
        sortBy(this.store.validators, [
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
    const [communityPoolArray, links, topVoters] = await Promise.all([
      this.query('/distribution/community_pool'),
      this.db.getNetworkLinks(this.network.id),
      this.getTopVoters(),
    ])
    const communityPool = communityPoolArray.find(
      ({ denom }) =>
        denom ===
        this.network.coinLookup.find(
          ({ viewDenom }) => viewDenom === this.network.stakingDenom
        ).chainDenom
    ).amount
    return {
      totalStakedAssets: fixDecimalsAndRoundUpBigNumbers(
        totalBondedTokens,
        2,
        this.network,
        this.network.stakingDenom
      ),
      totalVoters: undefined,
      treasurySize: fixDecimalsAndRoundUpBigNumbers(
        communityPool,
        2,
        this.network,
        this.network.stakingDenom
      ),
      topVoters: topVoters.map((topVoter) =>
        this.reducers.topVoterReducer(topVoter)
      ),
      links,
    }
  }

  async getDelegatorVote({ proposalId, address }) {
    this.checkAddress(address)
    const response = await this.query(`gov/proposals/${proposalId}/votes`)
    const votes = response || []
    const vote = votes.find(({ voter }) => voter === address) || {}
    return {
      option: vote.option,
    }
  }

  async getBlockByHeightV2(blockHeight) {
    let block, transactions
    if (blockHeight) {
      const response = await Promise.all([
        this.get(`blocks/${blockHeight}`),
        this.getTransactionsV2ByHeight(blockHeight),
      ])
      block = response[0]
      transactions = response[1]
    } else {
      block = await this.get(`blocks/latest`)
      transactions = await this.getTransactionsV2ByHeight(
        block.block.header.height
      )
    }
    return this.reducers.blockReducer(this.network.id, block, transactions)
  }

  async getBlockV2(blockHeight) {
    return await this.getBlockByHeightV2(blockHeight)
  }

  async getBlockHeader(blockHeight) {
    let block
    if (blockHeight) {
      block = await this.get(`blocks/${blockHeight}`)
    } else {
      block = await this.get(`blocks/latest`)
    }
    return this.reducers.blockHeaderReducer(this.network.id, block)
  }

  async getBalancesV2FromAddress(address, fiatCurrency, network) {
    this.checkAddress(address)
    const [balancesResponse, delegations, undelegations] = await Promise.all([
      this.query(`bank/balances/${address}`),
      this.getDelegationsForDelegatorAddress(address),
      this.getUndelegationsForDelegatorAddress(address),
    ])
    const balances = balancesResponse || []
    const coins = balances.map((coin) => {
      const coinLookup = network.getCoinLookup(coin.denom)
      return this.reducers.coinReducer(coin, coinLookup)
    })
    // also check if there are any balances as rewards
    const rewards = await this.getRewards(address, fiatCurrency, network)
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
    const hasStakingDenom = coins.find(
      ({ denom }) => denom === this.network.stakingDenom
    )
    // the user might not have liquid staking tokens but have staking tokens delegated
    // if we don't add the staking denom, we would show a 0 total for the staking denom which is wrong
    if (!hasStakingDenom) {
      coins.push({
        amount: BigNumber(0),
        denom: this.network.stakingDenom,
      })
    }
    const fiatValueAPI = this.fiatValuesAPI
    return await Promise.all(
      coins.map((coin) => {
        return this.reducers.balanceV2Reducer(
          coin,
          this.network.stakingDenom,
          delegations,
          undelegations,
          fiatValueAPI,
          fiatCurrency
        )
      })
    )
  }

  async getAccountInfo(address) {
    if (!address.startsWith(this.network.addressPrefix)) {
      throw new Error("This address doesn't exist in this network")
    }
    const response = await this.query(`auth/accounts/${address}`)
    const accountType = response.type
    const accountValue = response && response.value
    return this.reducers.accountInfoReducer(accountValue, accountType)
  }

  async getDelegationsForDelegatorAddress(address) {
    await this.dataReady
    this.checkAddress(address)
    const delegations =
      (await this.query(`staking/delegators/${address}/delegations`)) || []

    return delegations
      .map((delegation) =>
        this.reducers.delegationReducer(
          delegation,
          this.store.validators[delegation.validator_address],
          delegationEnum.ACTIVE,
          this.network
        )
      )
      .filter((delegation) => BigNumber(delegation.amount).gt(0))
  }

  async getUndelegationsForDelegatorAddress(address) {
    await this.dataReady
    this.checkAddress(address)
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
        this.store.validators[undelegation.validator_address]
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
        delegationEnum.ACTIVE,
        this.network
      )
    )
  }

  async getDelegationForValidator(delegatorAddress, validator) {
    this.checkAddress(delegatorAddress)

    const operatorAddress = validator.operatorAddress
    const delegation = await this.query(
      `staking/delegators/${delegatorAddress}/delegations/${operatorAddress}`
    ).catch(() => {
      const coinLookup = this.network.getCoinLookup(
        this.network.stakingDenom,
        'viewDenom'
      )
      return {
        validator_address: operatorAddress,
        delegator_address: delegatorAddress,
        shares: 0,
        balance: {
          amount: 0,
          denom: coinLookup.chainDenom,
        },
      }
    })
    return this.reducers.delegationReducer(
      delegation,
      validator,
      delegationEnum.ACTIVE,
      this.network
    )
  }

  async getAnnualProvision() {
    const response = await this.query(`minting/annual-provisions`)
    return response
  }

  async getExpectedReturns(validator) {
    const annualProvision = await this.getAnnualProvision()
    const expectedReturns = this.reducers.expectedRewardsPerToken(
      validator,
      validator.commission,
      annualProvision
    )
    return expectedReturns
  }

  async getRewards(delegatorAddress, fiatCurrency, network) {
    await this.dataReady
    this.checkAddress(delegatorAddress)
    const result = await this.query(
      `distribution/delegators/${delegatorAddress}/rewards`
    )
    const rewards = (result.rewards || []).filter(
      ({ reward }) => reward && reward.length > 0
    )
    return this.reducers.rewardReducer(
      rewards,
      this.store.validators,
      fiatCurrency,
      this.calculateFiatValue && this.calculateFiatValue.bind(this),
      this.reducers,
      network
    )
  }

  async getAllDelegators() {
    await this.dataReady
    const allDelegations = await Object.keys(this.store.validators).reduce(
      async (all, validator) => {
        const delegations = await this.query(
          `staking/validators/${validator}/delegations`
        )
        return (await all).concat(delegations)
      },
      []
    )
    return uniqBy(allDelegations, 'delegator_address').map(
      ({ delegator_address: delegatorAddress }) => delegatorAddress
    )
  }

  async loadPaginatedTxs(url, page = 1) {
    if (page < 1) {
      return []
    }
    const pagination = `&limit=${PAGE_RECORDS_COUNT}&page=${page}`
    const { txs } = await this.query(`${url}${pagination}`)
    return txs || []
  }

  async getPageCount(url) {
    const page = await this.query(url + `&limit=${PAGE_RECORDS_COUNT}`)
    return page.page_total
  }
}

module.exports = CosmosAPI
