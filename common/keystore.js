/*
 * This module assists in storing wallets encrypted in localstorage.
 * Wallets are stored by address to prevent accidental overwrite.
 * Loading and removal are protected by password checks.
 * This module also stores an index of all wallets by name for easy querying,
 * i.e. to show all wallets available.
 */

const KEY_TAG = `lunie-wallets`

// store a wallet encrypted in localstorage
export function storeWallet(
  serializedWallet,
  address,
  name,
  HDPath = `m/44'/118'/0'/0/0` // default
) {
  const storedWallet = getWallet(address)
  if (storedWallet) {
    throw new Error(
      "The wallet was already stored. Can't store the same wallet again."
    )
  }

  addToStorage(name, address, serializedWallet, HDPath)
}

// returns the index of the stored wallets
export function getWalletIndex() {
  const wallets = JSON.parse(localStorage.getItem(KEY_TAG + '-index') || '[]')
  return wallets
}

// loads an encrypted wallet from localstorage
export function getWallet(address) {
  const storedKey = localStorage.getItem(KEY_TAG + '-' + address)
  if (!storedKey) {
    return null
  }
  return JSON.parse(storedKey)
}

// stores an encrypted wallet in localstorage
function addToStorage(name, address, ciphertext, HDPath) {
  addToIndex(name, address, HDPath)

  const storedWallet = {
    name,
    address,
    wallet: ciphertext,
    HDPath,
  }

  localStorage.setItem(KEY_TAG + '-' + address, JSON.stringify(storedWallet))
}

// remove a wallet from localstorage
export function removeFromStorage(address) {
  removeFromIndex(address)
  localStorage.removeItem(KEY_TAG + '-' + address)
}

// stores the names of the keys to prevent name collision
function addToIndex(name, address, HDPath) {
  const storedIndex = getWalletIndex(false)

  if (storedIndex.find(({ name: storedName }) => name === storedName)) {
    throw new Error(`Key with that name already exists`)
  }

  storedIndex.push({ name, address, HDPath })
  localStorage.setItem(KEY_TAG + '-index', JSON.stringify(storedIndex))
}

function removeFromIndex(address) {
  const storedIndex = getWalletIndex(false)

  const updatedIndex = storedIndex.filter(
    ({ address: storedAddress }) => storedAddress !== address
  )
  localStorage.setItem(KEY_TAG + '-index', JSON.stringify(updatedIndex))
}
