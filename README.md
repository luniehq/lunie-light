# Lunie 3

Hello! 👋 Welcome to the Lunie 3 repo. 

Lunie 3 is a staking interface for proof-of-stake blockchains in the Cosmos ecosystem — built for speed, simplicity, and ease-of-use.

Lunie 3 uses [Nuxt.js](https://nuxtjs.org), and relies on the [REST API](https://cosmos.network/rpc) of a [Cosmos node](https://docs.cosmos.network/master/interfaces/rest.html) for data. 

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

## How on-chain data works

On-chain data is managed using the [Vuex store](https://nuxtjs.org/docs/2.x/directory-structure/store/). Understanding how [Vuex](https://vuex.vuejs.org/) works will be helpful for manipulating data in Lunie 3. 

### How data flows through Lunie 3

1. Middleware in the [`default.vue`](https://github.com/luniehq/lunie-light/blob/master/layouts/default.vue) file will call [`data/init`](https://github.com/luniehq/lunie-light/blob/master/layouts/default.vue#L24) to initialize the connection the Cosmos REST API before any pages are rendered. If the API is not initialized, requests will fail and data will not flow 🏄‍♂️
2. [Mutations](https://vuex.vuejs.org/guide/mutations.html) and [Actions](https://vuex.vuejs.org/guide/actions.html) are stored in the [`data.js`](https://github.com/luniehq/lunie-light/blob/master/store/data.js) file which manages the Vuex store and API requests
3. Actions in [`data.js`](https://github.com/luniehq/lunie-light/blob/master/store/data.js) will call query functions in the [`cosmos-source.js`](https://github.com/luniehq/lunie-light/blob/master/common/cosmosV3-source.js) file.
4. Reducers in [`cosmos-reducers.js`](https://github.com/luniehq/lunie-light/blob/master/common/cosmosV3-reducers.js) parse the responses from the API into a format that is easy for frontend Vue components to understand and work with

## How to deploy

On Netlify:

1. Add your forked 🍴  repo
2. Go to "Site Settings" > "Build & Deploy" > "Edit Settings"
3. Set the build command to `yarn generate`
4. Set the publish directory to `dist`

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## Thank you kindly! 
