<template>
  <v-navigation-drawer
    color="red darken-3"
    permanent
    absolute
    dark
    app
  >
    <v-list
      dense
      nav
      class="py-0"
    >
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>{{ username }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <ChannelGroup :channels="systemChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
      <ChannelGroup :channels="pinnedChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
      <ChannelGroup :channels="otherChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>

    </v-list>
  </v-navigation-drawer>
</template>

<script>
  import ChannelGroup from './ChannelGroup'

  export default {
    name: 'ChatDrawer',

    components: {
      ChannelGroup
    },

    props: {
      username: {
        type: String,
        required: true
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