<template>
  <v-container fluid pa-0 ma-0>

    <template v-if="(chat || {}).id">
      <v-layout
        class="chat-control-bar"
        @click="$emit('chat-select', null)"
      >
          <v-flex sm2 xs1><v-icon dark>mdi-arrow-left</v-icon></v-flex>
          <v-spacer></v-spacer>
          <v-flex sm8 xs9><span class="title">{{chat.title}}</span></v-flex>
      </v-layout>
      <ChatArea
        :chat-id="chat.id"
        :disabled="chat.restricted"
        :messages="messages"
        :username="username"
        @begin-conversation="$emit('begin-conversation', $event)"
      ></ChatArea>
    </template>

    <v-row v-else>
      <v-list dense dark class="chat-list">
        <ChannelGroup :channels="systemChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
        <ChannelGroup :channels="pinnedChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
        <ChannelGroup :channels="otherChannels" @channel-click="$emit('chat-select', $event)"></ChannelGroup>
      </v-list>
    </v-row>

  </v-container>
</template>

<script>
  import ChannelGroup from './ChannelGroup'
  import ChatArea from './ChatArea'

  export default {
    name: 'ChatLayoutSmall',

    components: {
      ChannelGroup,
      ChatArea
    },

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
  .chat-control-bar {
    position: fixed;
    top: 0.4rem;
    left: 0;
    z-index: 9999;
    min-width: 100%;
    padding-left: 1rem;
  }

  /*noinspection CssUnusedSymbol*/
  .chat-control-bar .v-icon {
    padding-top: 5px;
  }

  .chat-control-bar .title {
    margin-left: 10%;
  }

  .chat-list {
    width: 100%;
    padding: 0;
  }
</style>