/* required conversion of HD path for cosmjs */
export async function getHDPath(hdPathString) {
  const { Slip10RawIndex } = await import('@cosmjs/crypto')
  return hdPathString
    .split('/')
    .slice(1)
    .map((value) => {
      const length = value.length
      if (value[length - 1] === "'") {
        return Slip10RawIndex.hardened(Number(value.slice(0, length - 1)))
      }
      return Slip10RawIndex.normal(Number(value.slice(0, length)))
    })
}
