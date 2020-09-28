<template>
  <v-container fluid>

    sorry still working on mobile, try requesting desktop site for now

  </v-container>
</template>

<script>
  export default {
    name: 'ChatLayoutSmall',

    props: {
      chat: Object,
      username: {
        type: String,
        required: true
      },
      messages: {
        type: Array,
        default: () => []
      },
      systemChannels: {
        type: Array,
        default: () => []
      },
      pinnedChannels: {
        type: Array,
        default: () => []
      },
      otherChannels: {
        type: Array,
        default: () => []
      },
    }
  }
</script>

<style scoped>

</style>