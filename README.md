# Lunie Light (BETA)

Hello! 👋 Welcome to the Lunie Light Beta repo.

Lunie Light is a staking interface for proof-of-stake blockchains in the Cosmos ecosystem — built for speed, simplicity, and ease-of-use.

Lunie Light uses [Nuxt.js](https://nuxtjs.org), and relies on the [REST API](https://cosmos.network/rpc) of a [Cosmos node](https://docs.cosmos.network/master/interfaces/rest.html) for data.

Features:

- ✅ Super simple — one config file
- 🏎 Fast, modern web technologies
- 📱 Fully responsive
- ⛓ Real-time on-chain data
- 🔭 Explore mode
- 💸 Multi-denom balances support
- 🥩 Staking and unstaking management
- 💯 Complete validator list with instant search
- 🤗 Validator profiles for every validator
- 🧾 Transaction history

## Getting started

1. Edit the `networks.js` config file with the relevant details for your project
2. Run `yarn install` to install the app dependencies
3. Run `yarn dev` to serve the app at `localhost:3000`

### CORS

If the node you want to connect to doesn't have CORS enabled, you can't use it with the application. In this case use a CORS proxy (only in development) i.e. https://cors-anywhere.herokuapp.com/.

## How on-chain data works

On-chain data is managed using the [Vuex store](https://nuxtjs.org/docs/2.x/directory-structure/store/). Understanding how [Vuex](https://vuex.vuejs.org/) works will be helpful for manipulating data in Lunie Light.

### How data flows through Lunie Light

1. Middleware in the [`default.vue`](https://github.com/luniehq/lunie-light/blob/master/layouts/default.vue) file will call [`data/init`](https://github.com/luniehq/lunie-light/blob/master/layouts/default.vue#L24) to initialize the connection the Cosmos REST API before any pages are rendered. If the API is not initialized, requests will fail and data will not flow 🏄‍♂️
2. [Mutations](https://vuex.vuejs.org/guide/mutations.html) and [Actions](https://vuex.vuejs.org/guide/actions.html) are stored in the [`data.js`](https://github.com/luniehq/lunie-light/blob/master/store/data.js) file which manages the Vuex store and API requests
3. Actions in [`data.js`](https://github.com/luniehq/lunie-light/blob/master/store/data.js) will call query functions in the [`cosmos-source.js`](https://github.com/luniehq/lunie-light/blob/master/common/cosmosV3-source.js) file.
4. Reducers in [`cosmos-reducers.js`](https://github.com/luniehq/lunie-light/blob/master/common/cosmosV3-reducers.js) parse the responses from the API into a format that is easy for frontend Vue components to understand and work with

## How to deploy

On Netlify:

1. Add your forked 🍴 repo
2. Go to "Site Settings" > "Build & Deploy" > "Edit Settings"
3. Set the build command to `yarn generate`
4. Set the publish directory to `dist`

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## Customize to your chain

If your chain is equal to the latest Cosmos SDK version you can use Lunie as a plug and play software. This is likely not the case. Your chain might be on an older version or you might have edited some of the modules. What to do now? As described in `How data flows through Lunie Light` the central files to handle the mapping for data coming from your chain to the data the user sees happens in 2 files: `cosmos-source.js` and `cosmos-reducers.js`. Go through the UI and check which data points create errors or don't show expected values. Look for the according reducers in `cosmos-reducers.js` and adjust the mapping there to fit your data model. You should be good now. 🙌

## Thank you kindly!
