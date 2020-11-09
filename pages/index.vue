<template>
  <div class="content">
    <!-- <img class="network-icon" src="~/assets/images/currencies/atom.png" /> -->
    <h1>{{ network.name }}</h1>
    <h2>{{ network.description }}</h2>
    <div class="card-sign-in">
      <div class="session-list">
        <LiSession
          title="Start staking"
          :card="true"
          icon="gesture"
          route="/validators"
        />
        <LiSession
          title="Explore"
          :card="true"
          icon="language"
          route="/explore"
        />
      </div>
    </div>
    <div class="list-container">
      <ul>
        <h3>Helpful Links</h3>
        <li>
          <a :href="network.website" target="_blank">Project Website</a>
        </li>
        <li>
          <a :href="network.apiURL + '/node_info'" target="_blank">Node Info</a>
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
      <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache 2.0</a>
      <p>Use this software at your own risk.</p>
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
  padding: 5rem 2rem 2rem;
  margin: 0 auto;
  max-width: 800px;
}

.network-icon {
  height: 3rem;
  width: 3rem;
  margin-bottom: 2rem;
}

h1 {
  font-size: var(--text-4xl);
}

h2 {
  font-size: var(--text-lg);
  padding-bottom: 2rem;
}

h3 {
  font-size: var(--text-sm);
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
  padding: 2rem 0 4rem;
}

.session-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 3fr));
  column-gap: 1rem;
  row-gap: 1rem;
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

.disclaimer p {
  font-style: italic;
}
</style>
