<template>
  <v-list>
    <v-divider v-if="channels.length"></v-divider>
    <v-list-item
      v-for="channel in channels"
      :key="channel.title"
      @click="$emit('channel-click', channel)"
    >
      <v-list-item-content>
        <v-list-item-title>{{ channel.title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
  export default {
    name: 'ChannelGroup',

    props: {
      channels: {
        type: Array,
        default: () => []
      }
    }
  }
</script>

<style scoped>

</style>