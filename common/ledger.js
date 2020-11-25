import { getHDPath } from './hdpath'
import network from './network'

export async function getLedger(ledgerTransport) {
  const { LedgerSigner } = await import('@cosmjs/launchpad-ledger')
  const interactiveTimeout = 120_000
  const isWindows = navigator.platform.includes('Win')
  const hasHIDEnabled = !!navigator.hid

  let transport
  if (isWindows) {
    if (!hasHIDEnabled) {
      throw new Error(
        `Your browser doesn't have HID enabled. Please enable this feature by visiting: chrome://flags/#enable-experimental-web-platform-features`
      )
    }

    const { default: TransportWebHID } = await import(
      /* webpackChunkName: "webhid" */ '@ledgerhq/hw-transport-webhid'
    )
    if (!ledgerTransport) {
      transport = await TransportWebHID.create(
        interactiveTimeout,
        interactiveTimeout
      )
    }
  } else {
    // OSX, Linux
    const { default: TransportWebUSB } = await import(
      '@ledgerhq/hw-transport-webusb'
    )

    transport = await TransportWebUSB.create(
      interactiveTimeout,
      interactiveTimeout
    )
  }
  if (!transport) transport = ledgerTransport
  const ledger = new LedgerSigner(transport, {
    testModeAllowed: true,
    hdPaths: [await getHDPath(network.HDPath)],
    prefix: network.addressPrefix,
  })
  return { ledger, transport }
}

// limitation of the Ledger Nano S: if top5 is true, we pick the top 5 rewards and inform the user.
export function getRewardsValidators(rewards, top5) {
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
  const rewardsValidators = rewardsPerValidatorArray
    .sort((a, b) => b.totalRewardAmount - a.totalRewardAmount)
    .map((rewardPerValidator) => rewardPerValidator.validator)
  return top5 ? rewardsValidators.slice(0, 5) : rewardsValidators
}
