import { getWallet } from '~/common/keystore'

export async function getSigner(signingType, { address, password }) {
  if (signingType === `local`) {
    const { Secp256k1HdWallet } = await import('@cosmjs/launchpad')
    const { wallet: serializedWallet } = getWallet(address)
    const wallet = await Secp256k1HdWallet.deserialize(
      serializedWallet,
      password
    )
    return wallet
  }
  // else if (signingType === `ledger`) {
  //   return await getCosmosLedgerSigner({}) // gets config
  // }

  throw new Error(`Signing via ${signingType} is not supported`)
}

// async function getCosmosLedgerSigner(config) {
//   // TODO show which properties of config are actually needed
//   // importing default here to be compatible with Jest
//   const { default: Ledger } = await import('@lunie/cosmos-ledger')

//   return async (signMessage) => {
//     const ledger = new Ledger(config)
//     let publicKey, signature
//     try {
//       publicKey = await ledger.getPubKey()
//       signature = await ledger.sign(signMessage)
//     } catch (err) {
//       /* istanbul ignore next: specific error rewrite */
//       if (err.message.trim().startsWith('Device is already open')) {
//         throw new Error(
//           'Something went wrong connecting to your Ledger. Please refresh your page and try again.'
//         )
//       }
//       throw err
//     }

//     // cleanup. if we leave this open, the next connection will break for HID
//     ledger.cosmosApp.transport.close()

//     return {
//       signature,
//       publicKey,
//     }
//   }
// }
