import BigNumber from 'bignumber.js'
import { getSigner } from './signer'
import {
  getSignableObject,
  getBroadcastableObject,
} from './transaction-generation.js'
import messageCreators from './messages.js'
import fees from '~/fees'
import network from '~/network'

export default class TransactionManager {
  constructor(api) {
    this.api = api
  }

  async broadcastAPIRequest(payload) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }

    const response = await fetch(
      `${network.api_url}/txs`,
      options
    ).then((result) => result.json())
    return response
  }

  async getTransactionMetaData(transactionType, memo, senderAddress) {
    const { gasEstimate, fee } = fees[transactionType]
    const { accountNumber, accountSequence } = await this.api.getAccountInfo(
      senderAddress
    )
    const coinLookup = network.getCoinLookup(fee.denom, 'viewDenom')
    // converting view fee to on chain fee
    const convertedFee = [
      {
        amount: BigNumber(fee.amount)
          .div(coinLookup.chainToViewConversionFactor)
          .toNumber(),
        denom: coinLookup.chainDenom,
      },
    ]
    return {
      accountNumber,
      accountSequence,
      chainId: network.chain_id,
      gasEstimate: String(gasEstimate),
      fee: convertedFee,
      memo,
    }
  }

  async createSignBroadcast({
    messageType,
    message,
    transactionData,
    senderAddress,
    network,
    signingType,
    password,
    polkadotAPI,
    HDPath,
    curve,
  }) {
    const broadcastableObject = await this.createAndSignLocally(
      messageType,
      message,
      transactionData,
      senderAddress,
      network,
      signingType,
      password,
      polkadotAPI,
      HDPath,
      curve
    )
    return this.broadcastTransaction(
      broadcastableObject,
      messageType,
      message,
      network,
      senderAddress
    )
  }

  async createAndSignLocally(
    messageType,
    message,
    transactionData,
    senderAddress,
    network,
    signingType,
    password,
    HDPath,
    curve
  ) {
    const messages = messageCreators[messageType](
      senderAddress,
      message,
      network
    )
    // TODO signer doesn't respect HDPATH and CURVE
    const signer = await getSigner(signingType, {
      address: senderAddress,
      password,
      network,
      HDPath,
      curve,
    })

    const signableObject = await getSignableObject(messages, transactionData)
    const signedContext = await signer(signableObject)
    const broadcastableObject = await getBroadcastableObject(
      messages,
      transactionData,
      signedContext,
      HDPath,
      curve
    )

    return broadcastableObject
  }

  async broadcastTransaction(broadcastableObject) {
    const txPayload = {
      tx: broadcastableObject,
      mode: 'sync',
    }
    const result = await this.broadcastAPIRequest(txPayload)
    if (result.raw_log) {
      throw new Error('Broadcast was not successful: ' + result.raw_log)
    } else if (result.txhash) {
      return { hash: result.txhash }
    } else {
      throw new Error('Broadcast was not successful: ' + result.error)
    }
  }
}
