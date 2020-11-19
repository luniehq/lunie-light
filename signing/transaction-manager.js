import BigNumber from 'bignumber.js'
import {
  assertIsBroadcastTxSuccess,
  makeSignDoc,
  makeStdTx,
} from '@cosmjs/launchpad'
import { getSigner } from './signer'
import messageCreators from './messages.js'
import fees from '~/common/fees'
import network from '~/common/network'

export function getFees(transactionType, feeDenom) {
  const { gasEstimate, feeOptions } = fees.getFees(transactionType)
  const fee = feeOptions.find(({ denom }) => denom === feeDenom)
  const coinLookup = network.getCoinLookup(fee.denom, 'viewDenom')
  // converting view fee to on chain fee
  const convertedFee = [
    {
      amount: BigNumber(fee.amount)
        .div(coinLookup.chainToViewConversionFactor)
        .toString(),
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
  accountInfo,
  network,
  signingType,
  password,
  HDPath,
  feeDenom,
  chainId,
}) {
  const signer = await getSigner(
    signingType,
    {
      address: senderAddress,
      password,
    },
    chainId
  )

  const messages = messageCreators[messageType](senderAddress, message, network)

  const transactionData = getFees(messageType, feeDenom)
  const fee = {
    amount: transactionData.fee,
    gas: String(transactionData.gasEstimate),
  }

  const signDoc = makeSignDoc(
    [].concat(messages),
    fee,
    chainId,
    transactionData.memo,
    accountInfo.accountNumber,
    accountInfo.sequence
  )
  const { signed, signature } = await signer.sign(senderAddress, signDoc)
  const signedTx = makeStdTx(signed, signature)

  const broadcastBody = {
    tx: signedTx,
    mode: 'sync',
  }
  // TODO use axios?
  const broadcastResult = await fetch(
    `https://api.allorigins.win/get?url=http://34.123.30.100:1317/txs`,
    {
      method: 'POST',
      body: JSON.stringify(broadcastBody),
    }
  ).then((res) => res.json())
  assertIsBroadcastTxSuccess(broadcastResult)

  if (!assertIsBroadcastTxSuccess(broadcastResult)) {
    const error = broadcastResult.contents
      ? JSON.parse(broadcastResult.contents).error
      : `Unknown`
    throw new Error(`Transaction failed. Error: ${error}`)
  }

  return {
    hash: broadcastResult.transactionHash,
  }
}
