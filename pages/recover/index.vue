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
import { storeWallet, getNewWalletFromSeed } from '@lunie/cosmos-keys'
import network from '~/common/network'

const steps = [`Recover`, `Name`, `Password`]

export default {
  name: `recover`,
  data: () => ({
    steps,
    step: 'Recover',
    name: undefined,
    password: undefined,
    seed: undefined,
    address: undefined,
    errorMessage: undefined,
  }),
  methods: {
    onBack() {
      const stepIndex = steps.find((step) => step === this.step)
      if (stepIndex === 0) this.$router.go(-1)
      this.errorMessage = undefined
      this.step = stepIndex[stepIndex - 1]
    },
    setName(name) {
      this.name = name
      this.step = `Password`
    },
    setPassword(password) {
      this.password = password
      this.onSubmit()
    },
    setSeed(seed) {
      this.seed = seed
      const wallet = getNewWalletFromSeed(
        this.seed,
        network.address_prefix,
        network.HDPath,
        network.curve
      )
      this.address = wallet.cosmosAddress
      this.step = `Name`
    },
    onSubmit() {
      if (this.loading) return

      this.errorMessage = undefined
      this.loading = true
      try {
        const wallet = getNewWalletFromSeed(
          this.seed,
          network.address_prefix,
          network.HDPath,
          network.curve
        )
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
