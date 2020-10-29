<template>
  <SessionFrame icon="person_add" :on-back="onBack">
    <Steps :steps="steps" :active-step="step" />
    <ImportSeedStep v-if="step === 'Recover'" :seed="seed" @submit="setSeed" />
    <ImportNameStep
      v-if="step === 'Name'"
      :address="address"
      :name="name"
      @submit="setName"
    />
    <PasswordStep
      v-if="step === 'Password'"
      :password="password"
      @submit="setPassword"
    />
    <TmFormMsg v-if="errorMessage" type="custom" :msg="errorMessage" />
  </SessionFrame>
</template>

<script>
import network from '~/common/network'

export default {
  name: `recover`,
  data: () => ({
    steps: [`Recover`, `Name`, `Password`],
    step: 'Recover',
    name: undefined,
    password: undefined,
    seed: undefined,
    address: undefined,
    errorMessage: undefined,
  }),
  methods: {
    onBack() {
      const stepIndex = this.steps.findIndex((step) => step === this.step)
      if (stepIndex === 0) this.$router.go(-1)
      this.errorMessage = undefined
      this.step = this.steps[stepIndex - 1]
    },
    setName(name) {
      this.name = name
      this.step = `Password`
    },
    setPassword(password) {
      this.password = password
      this.onSubmit()
    },
    async setSeed(seed) {
      this.seed = seed
      const { getNewWalletFromSeed } = await import('@lunie/cosmos-keys')
      const wallet = getNewWalletFromSeed(
        this.seed,
        network.address_prefix,
        network.HDPath,
        network.curve
      )
      this.address = wallet.cosmosAddress
      this.step = `Name`
    },
    async onSubmit() {
      if (this.loading) return

      this.errorMessage = undefined
      this.loading = true
      try {
        const { getNewWalletFromSeed } = await import('@lunie/cosmos-keys')
        const wallet = getNewWalletFromSeed(
          this.seed,
          network.address_prefix,
          network.HDPath,
          network.curve
        )
        const { storeWallet } = await import('@lunie/cosmos-keys')
        storeWallet(
          wallet,
          this.name,
          this.password,
          network.id,
          network.HDPath,
          network.curve
        )
        this.$store.dispatch('signIn', {
          address: wallet.cosmosAddress,
          type: 'local',
        })
        this.$router.push({
          name: 'portfolio',
        })
      } catch (error) {
        this.loading = false
        this.errorMessage = error.message
      }
    },
  },
}
</script>
