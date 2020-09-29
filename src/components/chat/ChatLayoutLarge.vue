<template>
  <v-container fluid ma-0 pa-0>
    <v-row no-gutters>
      <v-col class="scrollable">
        <v-list
          dense
          dark
          class="chat-list"
        >
          <ChannelGroup :channels="systemChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
          <ChannelGroup :channels="pinnedChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
          <ChannelGroup :channels="otherChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
        </v-list>
      </v-col>
      <v-col sm="10">
        <ChatArea
          v-if="chat.id"
          :chat-id="chat.id"
          :disabled="chat.restricted"
          :messages="messages"
          :username="username"
          @begin-conversation="$emit('begin-conversation', $event)"
        ></ChatArea>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
  import ChannelGroup from './ChannelGroup'
  import ChatArea from './ChatArea'

  export default {
    name: 'ChatLayoutLarge',

    components: {
      ChannelGroup,
      ChatArea
    },

    props: {
      chat: Object,
      username: String,
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
    },

  }
</script>

<style scoped>
  .scrollable {
    overflow-y: auto;
  }

  .chat-list {
    width: 100%;
    padding: 0;
    background: #182026;
  }
</style>