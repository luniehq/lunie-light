const bech32 = require('bech32')

const getAddressType = (address) => {
  if (address.startsWith('0x')) return 'ethereum'
  try {
    bech32.decode(address)
    return 'cosmos'
  } catch (error) {
    // ignore error
  }
  return 'any'
}

const formatAddress = (address, length = 4) => {
  if (!address) {
    return `Address Not Found`
  }
  switch (getAddressType(address)) {
    case 'cosmos':
      return address.split(`1`)[0] + `…` + address.slice(-1 * length)
    case 'ethereum':
      return address.slice(0, 2 + length) + `…` + address.slice(-1 * length)
    case 'any':
      return address.slice(0, length) + `…` + address.slice(-1 * length)
  }
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
}
