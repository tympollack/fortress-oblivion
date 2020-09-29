<template>
  <div class="text-center">
    <v-progress-circular
      rotate=270
      size=269
      width=5
      color="red darken-3"
      :value="value"
      :indeterminate="indeterminate"
    >
      <slot></slot>
    </v-progress-circular>
  </div>
</template>

<script>
  export default {
    name: 'AppProgressCircular',

    props: {
      indeterminate: Boolean,
      value: Number,
    }
  }
</script>

<style scoped>

</style>