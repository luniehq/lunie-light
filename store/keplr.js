import network from '~/common/network'

export const state = () => ({
  accounts: [],
  initialized: false,
  error: undefined,
  loading: false,
})

export const mutations = {
  setAccounts(state, accounts) {
    state.accounts = accounts
  },
  setInitialized(state) {
    state.initialized = true
  },
  setError(state, error) {
    state.error = error
  },
  setLoading(state, loading) {
    state.loading = loading
  },
}

export const actions = {
  async init({ commit, dispatch }, trys = 0) {
    commit('setError', undefined)
    commit('setLoading', true)

    // sometimes the page loads quicker the keplr is available
    // so we try again for a couple of times but give up at somepoint
    if (!window.keplr && trys < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      dispatch('init', trys + 1)
    }
    if (window.keplr && window.keplr.experimentalSuggestChain) {
      const block = await dispatch('data/getBlock', undefined, { root: true })
      try {
        // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
        // cosmoshub-3 is integrated to Keplr so the code should return without errors.
        // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
        // If the user approves, the chain will be added to the user's Keplr extension.
        // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
        // If the same chain id is already registered, it will resolve and not require the user interactions.
        await window.keplr.experimentalSuggestChain({
          // Chain-id of the Cosmos SDK chain.
          chainId: block.chainId,
          // The name of the chain to be displayed to the user.
          chainName: network.name,
          // RPC endpoint of the chain.
          rpc: network.rpcURL,
          // REST endpoint of the chain.
          rest: network.apiURL,
          // Staking coin information
          stakeCurrency: lunieCoinToKeplrCoin(network.stakingDenom),
          // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
          // The 'stake' button in Keplr extension will link to the webpage.
          // walletUrlForStaking: "",
          // The BIP44 path.
          bip44: {
            // You can only set the coin type of BIP44.
            // 'Purpose' is fixed to 44.
            coinType: 118,
          },
          // Bech32 configuration to show the address to user.
          // This field is the interface of
          // {
          //   bech32PrefixAccAddr: string;
          //   bech32PrefixAccPub: string;
          //   bech32PrefixValAddr: string;
          //   bech32PrefixValPub: string;
          //   bech32PrefixConsAddr: string;
          //   bech32PrefixConsPub: string;
          // }
          bech32Config: {
            bech32PrefixAccAddr: network.addressPrefix,
            bech32PrefixAccPub: network.addressPrefix + 'pub',
            bech32PrefixValAddr: network.addressPrefix + 'valoper',
            bech32PrefixValPub: network.addressPrefix + 'valoperpub',
            bech32PrefixConsAddr: network.addressPrefix + 'valcons',
            bech32PrefixConsPub: network.addressPrefix + 'valconspub',
          },
          // List of all coin/tokens used in this chain.
          currencies: network.coinLookup.map(({ viewDenom }) =>
            lunieCoinToKeplrCoin(viewDenom)
          ),
          // List of coin/tokens used as a fee token in this chain.
          feeCurrencies: network.coinLookup.map(({ viewDenom }) =>
            lunieCoinToKeplrCoin(viewDenom)
          ),
          // (Optional) The number of the coin type.
          // This field is only used to fetch the address from ENS.
          // Ideally, it is recommended to be the same with BIP44 path's coin type.
          // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
          // So, this is separated to support such chains.
          coinType: 118,
          // (Optional) This is used to set the fee of the transaction.
          // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
          // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
          // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
          // gasPriceStep: {
          //     low: 0.01,
          //     average: 0.025,
          //     high: 0.04
          // }
        })
        await window.keplr.enable(block.chainId)

        const offlineSigner = window.getOfflineSigner(block.chainId)

        // You can get the address/public keys by `getAccounts` method.
        // It can return the array of address/public key.
        // But, currently, Keplr extension manages only one address/public key pair.
        // XXX: This line is needed to set the sender address for SigningCosmosClient.
        const accounts = await offlineSigner.getAccounts()
        commit('setAccounts', accounts)

        commit('setInitialized')
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        return
      }
    }

    commit('setLoading', false)
  },
}

function lunieCoinToKeplrCoin(denom) {
  const coinLookup = network.getCoinLookup(denom, 'viewDenom')
  return {
    // Coin denomination to be displayed to the user.
    coinDenom: coinLookup.viewDenom,
    // Actual denom (i.e. uatom, uscrt) used by the blockchain.
    coinMinimalDenom: coinLookup.chainDenom,
    // # of decimal points to convert minimal denomination to user-facing denomination.
    coinDecimals: coinLookup.chainToViewConversionFactor
      .toString()
      .split('.')[1].length,
    // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
    // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
    // coinGeckoId: ""
  }
}
