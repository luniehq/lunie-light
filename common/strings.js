export const capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const noBlanks = function (value) {
  return value === undefined ||
    value === null ||
    value === `` ||
    value === `[do-not-modify]`
    ? `--`
    : value
}
