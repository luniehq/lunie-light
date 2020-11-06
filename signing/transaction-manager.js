import BigNumber from 'bignumber.js'
import {
  SigningCosmosClient,
  assertIsBroadcastTxSuccess,
} from '@cosmjs/launchpad'
import { getSigner } from './signer'
import messageCreators from './messages.js'
import fees from '~/common/fees'
import network from '~/common/network'

export function getFees(transactionType) {
  const { gasEstimate, fee } = fees.getFees(transactionType)
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
    gasEstimate: String(gasEstimate),
    fee: convertedFee,
  }
}

export async function createSignBroadcast({
  messageType,
  message,
  senderAddress,
  network,
  signingType,
  password,
  HDPath,
}) {
  // TODO signer doesn't respect HDPATH
  const signer = await getSigner(signingType, {
    address: senderAddress,
    password,
    network,
    HDPath,
  })

  const messages = messageCreators[messageType](senderAddress, message, network)

  const transactionData = this.getFees(messageType)
  const fee = {
    amount: transactionData.fee,
    gas: String(transactionData.gasEstimate),
  }

  const client = new SigningCosmosClient(network.apiURL, senderAddress, signer)
  const broadcastResult = await client.signAndBroadcast(
    messages,
    fee,
    transactionData.memo
  )
  assertIsBroadcastTxSuccess(broadcastResult)
}
