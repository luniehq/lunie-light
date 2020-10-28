const CosmosV0API = require('./cosmosV0-source')
const PAGE_RECORDS_COUNT = 20

class CosmosV2API extends CosmosV0API {
  setReducers() {
    this.reducers = require('./cosmosV2-reducers')
  }

  async query(url, resultSelector = 'result') {
    const response = await this.getRetry(url)
    return response[resultSelector]
  }

  async getValidatorSigningInfos() {
    const signingInfos = await this.query(`slashing/signing_infos`)
    return signingInfos
  }

  async loadPaginatedTxs(url, page = 1) {
    if (page < 1) {
      return []
    }
    const pagination = `&limit=${PAGE_RECORDS_COUNT}&page=${page}`
    const { txs } = await this.getRetry(`${url}${pagination}`)
    return txs || []
  }

  async getPageCount(url) {
    const page = await this.getRetry(url + `&limit=${PAGE_RECORDS_COUNT}`)
    return page.page_total
  }

  async getTransactionsV2(address, pageNumber = 0) {
    this.checkAddress(address)

    // getting page count
    const [senderPage, recipientPage] = await Promise.all([
      this.getPageCount(`/txs?message.sender=${address}`),
      this.getPageCount(`/txs?transfer.recipient=${address}`),
    ])

    // dirty hack to fix first page +1
    pageNumber = pageNumber ? pageNumber + 1 : pageNumber
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
}

module.exports = CosmosV2API
