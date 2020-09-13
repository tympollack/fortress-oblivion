<template>
  <v-btn
      block
      class="app-button"
      dark
      tile
      x-large
      :loading="loading"
      @click="$emit('click')"
  >
    <div><slot>{{ heading }}</slot></div>
    <div>{{ subheading }}</div>
  </v-btn>
</template>

<script>
  export default {
    name: 'AppButton',

    props: {
      loading: Boolean,
      subheading: String,
      heading: String,
    }
  }
</script>

<style>
  .app-button > span {
    display: block !important;
  }

  .app-button > span > div:first-child {
    letter-spacing: 3px;
  }

  .app-button > span > div:nth-child(2) {
    color: #999;
    text-transform: lowercase;
  }
</style>