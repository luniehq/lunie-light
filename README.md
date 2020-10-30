# lunie3

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

### CORS

If the node you want to connect to doesn't have CORS enabled, you can't use it with the application. In this case run a local reverse CORS proxy: https://github.com/wmhilton/cors-buster
After setting this proxy up and running it, change `apiUrl` and `rpcUrl` in `network.js` to `http://localhost:9999/{{URL WITH NO HTTP/HTTPS}}.
