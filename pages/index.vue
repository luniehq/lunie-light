<template>
  <div class="content">
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
      <h3>Helpful Links</h3>
      <ul>
        <li>
          <a
            :href="network.website"
            target="_blank"
            rel="nofollow noreferrer noopener"
            >Project Website</a
          >
        </li>
        <li>
          <a
            :href="network.apiURL + '/node_info'"
            target="_blank"
            rel="nofollow noreferrer noopener"
            >Node Info</a
          >
        </li>
        <!-- <li>
          <a
            href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
            target="_blank"
            rel="nofollow noreferrer noopener"
            >Keplr Browser Extension</a
          >
        </li>
        <li>
          <a href="https://www.ledger.com/" target="_blank" rel="nofollow noreferrer noopener"
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
  padding: 2rem;
  margin: 3rem auto;
  max-width: 750px;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
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
  flex-direction: column;
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
  font-size: 12px;
  color: var(--txt);
}

.disclaimer p {
  font-style: italic;
}

@media screen and (max-width: 667px) {
  .content {
    box-shadow: none;
    border-radius: 0;
    background: var(--white);
    margin: 0;
  }
}
</style>
