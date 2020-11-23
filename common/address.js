const crypto = require('crypto')
const bech32 = require('bech32')

const hexToValidatorAddress = (address, validatorPrefix) => {
  const words = bech32.toWords(Buffer.from(address, 'hex'))
  return bech32.encode(validatorPrefix, words)
}
const pubkeyToAddress = (cosmosvalconspub, validatorConsensusBech32Prefix) => {
  const words = bech32.decode(cosmosvalconspub).words
  // publickey is prefixed somehow (probably amino)
  const publicKey = Buffer.from(
    Buffer.from(bech32.fromWords(words)).toString('hex').substr(10),
    'hex'
  )
  // the address is the first 20 bytes of the sha256 hash of the publickey
  const hexAddress = crypto
    .createHash('sha256')
    .update(publicKey)
    .digest()
    .toString('hex')
    .substr(0, 40)
  return hexToValidatorAddress(hexAddress, validatorConsensusBech32Prefix)
}

const formatAddress = (address, length = 4) => {
  if (!address) {
    return `Address Not Found`
  }
  return address.split(`1`)[0] + `…` + address.slice(-1 * length)
}

module.exports = {
  formatAddress,
  decodeB32(value) {
    const words = bech32.decode(value)
    return Buffer.from(bech32.fromWords(words.words)).toString(`hex`)
  },
  encodeB32(value, prefix = `cosmos1`, type = `hex`) {
    const words = bech32.toWords(Buffer.from(value, type))
    return bech32.encode(prefix, words)
  },
  validatorEntry(validator) {
    return `${validator.name} - ${formatAddress(validator.operatorAddress, 20)}`
  },
  pubkeyToAddress,
}
