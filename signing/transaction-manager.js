import BigNumber from 'bignumber.js'
import { makeStdTx, makeSignDoc } from '@cosmjs/launchpad'
import axios from 'axios'
import { getSigner } from './signer'
import messageCreators from './messages.js'
import fees from '~/common/fees'
import network from '~/common/network'
import { signWithExtension } from '~/common/extension-utils'

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
  memo,
  ledgerTransport,
}) {
  const feeData = getFees(messageType, feeDenom)
  const transactionData = {
    ...feeData,
    memo,
    chainId,
    accountNumber: accountInfo.accountNumber,
    accountSequence: accountInfo.sequence,
  }

  let signedTx

  if (signingType === 'extension') {
    signedTx = await signWithExtension(
      messageType,
      message,
      transactionData,
      senderAddress,
      network
    )
  } else {
    const signer = await getSigner(
      signingType,
      {
        address: senderAddress,
        password,
      },
      chainId,
      ledgerTransport
    )

    const messages = messageCreators[messageType](
      senderAddress,
      message,
      network
    )

    const signDoc = makeSignDoc(
      [].concat(messages),
      {
        amount: transactionData.fee,
        gas: transactionData.gasEstimate,
      },
      chainId,
      memo || '',
      accountInfo.accountNumber,
      accountInfo.sequence
    )

    const { signed, signature } = await signer.sign(senderAddress, signDoc)
    signedTx = makeStdTx(signed, signature)
  }

  const broadcastBody = {
    tx: signedTx,
    mode: 'sync', // if we use async we don't wait for checks on the tx to have passed so we don't get errors
  }
  const broadcastResult = await axios
    .post(`${network.apiURL}/txs`, broadcastBody)
    .then((res) => res.data)
  assertIsBroadcastTxSuccess(broadcastResult)

  return {
    hash: broadcastResult.txhash,
  }
}

export function assertIsBroadcastTxSuccess(res) {
  if (!res) throw new Error(`Error sending transaction`)
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`)

    res.forEach(assertIsBroadcastTxSuccess)
  }

  if (res.error) {
    throw new Error(res.error)
  }

  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (res.code) {
    const message = res.raw_log.message
      ? JSON.parse(res.raw_log).message
      : res.raw_log
    throw new Error(message)
  }

  if (!res.txhash) {
    const message = res.message
    throw new Error(message)
  }

  return res
}

export async function pollTxInclusion(txHash, iteration = 0) {
  const MAX_POLL_ITERATIONS = 30
  let txFound = false
  try {
    await fetch(`${network.apiURL}/txs/${txHash}`).then((res) => {
      if (res.status === 200) {
        txFound = true
      }
    })
  } catch (err) {
    // ignore error
  }
  if (txFound) {
    return true
  } else if (iteration < MAX_POLL_ITERATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return pollTxInclusion(txHash, iteration + 1)
  } else {
    throw new Error(
      `The transaction wasn't included in time. Check explorers for the transaction hash ${txHash}.`
    )
  }
}
