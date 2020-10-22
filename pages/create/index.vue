<template>
  <SessionFrame icon="person_add" :on-back="onBack">
    <Steps :steps="steps" :active-step="step" />
    <NameStep v-if="step === 'Name'" :name="name" @submit="setName" />
    <PasswordStep
      v-if="step === 'Password'"
      :password="password"
      @submit="setPassword"
    />
    <NewSeedStep v-if="step === 'Backup'" :seed="seed" @submit="setSeed" />
    <TmFormMsg v-if="errorMessage" type="custom" :msg="errorMessage" />
  </SessionFrame>
</template>

<script>
import { storeWallet, getNewWalletFromSeed } from '@lunie/cosmos-keys'
import network from '~/network'

const steps = [`Name`, `Password`, `Backup`]

export default {
  name: `sign-up`,
  data: () => ({
    steps,
    step: 'Name',
    name: undefined,
    password: undefined,
    seed: undefined,
    errorMessage: undefined,
  }),
  methods: {
    onBack() {
      const stepIndex = steps.findIndex((step) => step === this.step)
      if (stepIndex === 0) this.$router.go(-1)
      this.errorMessage = undefined
      this.step = steps[stepIndex - 1]
    },
    setName(name) {
      this.name = name
      this.step = `Password`
    },
    setPassword(password) {
      this.password = password
      this.step = `Backup`
    },
    setSeed(seed) {
      this.seed = seed
      this.onSubmit()
    },
    onSubmit() {
      if (this.loading) return

      this.loading = true
      this.errorMessage = undefined
      try {
        const wallet = getNewWalletFromSeed(
          this.seed,
          network.bech32Prefix,
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
        this.$cookies.set('address', wallet.cosmosAddress)
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
