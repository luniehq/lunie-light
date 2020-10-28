import { formatAddress } from '~/common/address'

export const resolveValidatorName = (address, validators) => {
  // Substrate validators can have their operatorAddress as their name, which is too long and thus breaks the
  // extension size. If name is too long, then we just display the formatted address
  if (validators[address] && validators[address].name.length < 20) {
    return validators[address].name
  }
  return formatAddress(address)
}
