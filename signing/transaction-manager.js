import BigNumber from 'bignumber.js'
import {
  SigningStargateClient,
  QueryClient,
  assertIsBroadcastTxSuccess,
} from '@cosmjs/stargate'
import { BroadcastMode } from '@cosmjs/launchpad'
import { Client as TendermintClient } from '@cosmjs/tendermint-rpc'
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
  console.log('Will signer be useful for something?', signer)

  const messages = messageCreators[messageType](senderAddress, message, network)

  const transactionData = getFees(messageType, feeDenom)
  const fee = {
    amount: transactionData.fee,
    gas: String(transactionData.gasEstimate),
  }
  const tendermintClient = await TendermintClient.connect(network.rpcURL)
  const queryClient = new QueryClient(tendermintClient)
  const client = new SigningStargateClient(
    tendermintClient,
    queryClient,
    BroadcastMode.Async // check
  )
  const broadcastResult = await client.signAndBroadcast(
    [].concat(messages),
    fee,
    transactionData.memo
  )
  assertIsBroadcastTxSuccess(broadcastResult)

  return {
    hash: broadcastResult.transactionHash,
  }
}
