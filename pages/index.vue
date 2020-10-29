<template>
  <div class="content">
    <img class="network-icon" src="~/assets/images/currencies/atom.png" />
    <h1>{{ network.name }}</h1>
    <h2>{{ network.description }}</h2>
    <TmBtn value="Get Started" @click.native="$router.push('/address')" />
    <div class="list-container">
      <ul>
        <h3>Helpful Links</h3>
        <li>
          <a :href="network.website" target="_blank">Project Website</a>
        </li>
        <li>
          <a :href="network.api_url + '/node_info'" target="_blank"
            >Node Info</a
          >
        </li>
        <!-- <li>
          <a
            href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
            target="_blank"
            >Keplr Browser Extension</a
          >
        </li>
        <li>
          <a href="https://www.ledger.com/" target="_blank"
            >Ledger Hardware Wallet</a
          >
        </li> -->
      </ul>
    </div>
    <div class="disclaimer">
      <p>
        <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache 2.0</a>
      </p>
      <p>Disclaimer: Use this software at your own risk.</p>
    </div>
  </div>
</template>

<script>
import network from '~/common/network'

export default {
  name: `home`,
  data: () => ({
    network,
  }),
}
</script>

<style scoped>
.content {
  padding: 2rem;
  margin: 0 auto;
  max-width: 800px;
}

.network-icon {
  height: 3rem;
  width: 3rem;
  margin-bottom: 2rem;
}

h1 {
  font-size: 44px;
  font-weight: 700;
  padding-bottom: 1rem;
}

h2 {
  font-size: 18px;
  padding-bottom: 2rem;
}

h3 {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding-bottom: 0.5rem;
}

ul {
  padding-right: 3rem;
}

.learn-more {
  padding-bottom: 4rem;
}

.list-container {
  display: flex;
  padding: 6rem 0 4rem;
}

span {
  font-size: 14px;
  display: block;
}

.disclaimer {
  padding-bottom: 2rem;
  font-size: 12px;
  color: var(--txt);
}
</style>
