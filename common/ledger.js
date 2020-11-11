import { getHDPath } from './hdpath'
import network from './network'

export async function getLedger() {
  const { LedgerSigner } = await import('@cosmjs/launchpad-ledger')
  const TransportWebUSB = await import('@ledgerhq/hw-transport-webusb')

  const interactiveTimeout = 120_000
  const ledgerTransport = await TransportWebUSB.create(
    interactiveTimeout,
    interactiveTimeout
  )
  const ledger = new LedgerSigner(ledgerTransport, {
    testModeAllowed: true,
    hdPaths: [getHDPath(network.HDPath)],
  })
  return ledger
}
