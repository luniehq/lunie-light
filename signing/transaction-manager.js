import BigNumber from 'bignumber.js'
import { getSigner } from './signer'
import {
  getSignableObject,
  getBroadcastableObject,
} from './transaction-generation.js'
import messageCreators from './messages.js'
import fees from '~/common/fees'
import network from '~/common/network'

export default class TransactionManager {
  async broadcastAPIRequest(payload) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }

    const response = await fetch(
      `${network.apiURL}/txs`,
      options
    ).then((result) => result.json())
    return response
  }

  getTransactionMetaData(
    transactionType,
    memo,
    denom,
    { accountNumber, sequence }
  ) {
    const transactionFees = fees.getFees(transactionType)
    const { gasEstimate, fee } = Array.isArray(transactionFees)
      ? transactionFees.find(({ fee }) => fee.denom === denom)
      : transactionFees
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
      accountSequence: sequence,
      chainId: network.chainId,
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
    if (result.code) {
      throw new Error('Broadcast was not successful: ' + result.raw_log)
    } else if (result.txhash) {
      return { hash: result.txhash }
    } else {
      throw new Error('Broadcast was not successful: ' + result.error)
    }
  }
}
