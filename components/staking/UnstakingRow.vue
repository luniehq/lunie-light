<template>
  <tr
    class="validator"
    :data-moniker="validator.name"
    @click="
      $router.push({
        name: 'validator',
        params: { validator: validator.operatorAddress },
      })
    "
  >
    <td>{{ index + 1 }}</td>
    <td>
      <Avatar
        class="validator-image"
        alt="generic validator logo - generated avatar from address"
        :address="validator.operatorAddress"
      />
      <div class="validator-info">
        <h3 class="validator-name">
          {{ validator.name }}
        </h3>
        <h4>
          {{ undelegation.amount }}
        </h4>
      </div>
    </td>
    <td>
      {{ undelegation.endTime | fromNow }}
    </td>
  </tr>
</template>

<script>
import { fromNow } from '~/common/time'

export default {
  name: `undelegation`,
  filters: {
    fromNow,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    validator: {
      type: Object,
      required: true,
    },
    undelegation: {
      type: Object,
      required: true,
    },
  },
}
</script>
<style scoped>
.validator {
  padding: 0.5rem 1rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--bc-dim);
  border-radius: var(--border-radius);
}

.validator-info {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  text-overflow: ellipsis;
}

.validator h4,
.validator h5 {
  font-size: var(--text-xs);
  display: inline-block;
}

.validator h5 {
  padding-left: 0.5rem;
  color: var(--success);
}

.validator:hover {
  cursor: pointer;
  background: var(--app-fg-hover);
  color: var(--bright);
}

.validator-name {
  font-size: 1rem;
  line-height: 20px;
  font-weight: 500;
  color: var(--bright);
  display: inline-block;
}

.validator-image {
  border-radius: var(--border-radius);
  height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  border: 1px solid var(--bc-dim);
}
</style>
