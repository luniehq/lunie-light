import { getHDPath } from './hdpath'
import network from './network'

export async function getLedger() {
  const { LedgerSigner } = await import('@cosmjs/launchpad-ledger')
  const { default: TransportWebUSB } = await import(
    '@ledgerhq/hw-transport-webusb'
  )

  const interactiveTimeout = 120_000
  const ledgerTransport = await TransportWebUSB.create(
    interactiveTimeout,
    interactiveTimeout
  )
  const ledger = new LedgerSigner(ledgerTransport, {
    testModeAllowed: true,
    hdPaths: [await getHDPath(network.HDPath)],
    prefix: network.addressPrefix,
  })
  return ledger
}

// limitation of the Ledger Nano S, so we pick the top 5 rewards and inform the user.
export function getTop5RewardsValidators(rewards) {
  const rewardsPerValidatorObject = rewards.reduce((all, reward) => {
    return {
      ...all,
      [reward.validator.operatorAddress]:
        Number(reward.amount) +
        (Number(all[reward.validator.operatorAddress]) || 0),
    }
  }, {})
  const rewardsPerValidatorAddresses = Object.keys(rewardsPerValidatorObject)
  const rewardsPerValidatorArray = []
  rewardsPerValidatorAddresses.forEach((validatorAddress, index) => {
    rewardsPerValidatorArray.push({
      validator: validatorAddress,
      totalRewardAmount: Object.values(rewardsPerValidatorObject)[index],
    })
  })
  return rewardsPerValidatorArray
    .sort((a, b) => b.totalRewardAmount - a.totalRewardAmount)
    .slice(0, 5)
    .map((rewardPerValidator) => rewardPerValidator.validator)
}
