<template>
  <ActionModal
    id="modal-vote"
    ref="actionModal"
    :validate="validateForm"
    title="Vote"
    class="modal-vote"
    submission-error-prefix="Voting failed"
    :transaction-type="lunieMessageTypes.VOTE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="vote"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <div class="action-modal-group vote-options">
      <div>
        <Button
          id="vote-yes"
          :disabled="lastVoteOption === `Yes`"
          :type="vote === `Yes` ? 'active' : 'secondary'"
          value="Yes"
          size="md"
          @click.native="vote = 'Yes'"
        />
        <Button
          id="vote-veto"
          :disabled="lastVoteOption === `NoWithVeto`"
          :type="vote === `NoWithVeto` ? 'active' : 'secondary'"
          value="No With Veto"
          size="md"
          @click.native="vote = 'NoWithVeto'"
        />
      </div>
      <div>
        <Button
          id="vote-no"
          :disabled="lastVoteOption === `No`"
          :type="vote === `No` ? 'active' : 'secondary'"
          value="No"
          size="md"
          @click.native="vote = 'No'"
        />
        <Button
          id="vote-abstain"
          :disabled="lastVoteOption === `Abstain`"
          :type="vote === `Abstain` ? 'active' : 'secondary'"
          value="Abstain"
          size="md"
          @click.native="vote = 'Abstain'"
        />
      </div>
    </div>
    <FormMessage
      v-if="$v.vote.$error && !$v.vote.required"
      name="Vote"
      type="required"
    />
  </ActionModal>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { lunieMessageTypes } from '~/common/lunie-message-types'

const isValid = (option) =>
  option === `Yes` ||
  option === `No` ||
  option === `NoWithVeto` ||
  option === `Abstain`

export default {
  name: `ModalVote`,
  props: {
    proposalId: {
      type: [Number, String],
      required: true,
    },
    proposalTitle: {
      type: String,
      required: true,
    },
    lastVoteOption: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    vote: null,
    lunieMessageTypes,
  }),
  computed: {
    transactionData() {
      return {
        type: lunieMessageTypes.VOTE,
        proposalId: String(this.proposalId),
        voteOption: this.vote,
      }
    },
    notifyMessage() {
      return {
        title: `Successful vote!`,
        body: `You have successfully voted ${this.vote} on proposal #${this.proposalId}`,
      }
    },
  },
  validations() {
    return {
      vote: {
        required,
        isValid,
      },
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.vote = null
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
}
</script>

<style scoped>
.action-modal-group.vote-options {
  padding: 1rem 0;
  display: flex;
  max-width: 75%;
  margin: 0 auto;
}

.action-modal-group.vote-options > div {
  width: 50%;
  margin: 0 0.25rem;
}

.vote-options button {
  margin: 0.5rem 0;
  height: 5rem;
  width: 100%;
}
</style>
