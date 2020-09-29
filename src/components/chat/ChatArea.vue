<template>
  <v-container fluid pa-0 ma-0>
    <div class="chat-container" ref="chatContainer" @scroll="onScroll">
      <AppProgressCircular
        v-if="chatLoading"
        indeterminate
      ></AppProgressCircular>

      <div v-else-if="!messages.length" class="message center"><span>No one has said anything yet.</span></div>

      <div v-else v-for="message in messages" :class="isOwnMessage(message) ? 'message own' : 'message'">
        <template v-if="!isOwnMessage(message)">
          <span class="username" @click="$emit('begin-conversation', message.senderId)">{{message.sender}}</span>:
        </template>
        <span class="content">{{message.content}}</span>
      </div>
    </div>
    <div class="message-input-area" ref="messageInputArea">
      <v-text-field
        ref="messageBox"
        autocomplete="off"
        clearable
        dark
        outlined
        hide-details
        v-model="message"
        label="Start typing..."
        :disabled="isTypingDisabled"
        :append-outer-icon="isSendingDisabled ? 'mdi-send-lock' : 'mdi-send'"
        @click:append-outer="sendMessage"
        @keyup.enter="sendMessage"
      ></v-text-field>
    </div>
  </v-container>
</template>

<script>
  import AppProgressCircular from '../app/AppProgressCircular'

  export default {
    name: 'ChatArea',

    components: {
      AppProgressCircular
    },

    props: {
      username: String,
      disabled: Boolean,
      chatId: String,
      messages: {
        type: Array,
        default: () => []
      },
    },

    data: () => ({
      message: '',
      sendingMessage: false,
      chatLoading: false
    }),

    computed: {
      isMessageValid() {
        return this.message && this.message.trim().length
      },

      isSendingDisabled() {
        return this.isTypingDisabled || !this.isMessageValid
      },

      isTypingDisabled() {
        return this.disabled || this.sendingMessage
      },
    },

    watch: {
      messages() {
        this.chatLoading = false
        this.scrollToBottom()
      },

      chatId() {
        this.chatLoading = true
      }
    },

    methods: {
      isOwnMessage(message) {
        return message.sender === this.username
      },

      async sendMessage() {
        if (!this.isMessageValid) {
          return
        }

        this.sendingMessage = true
        try {
          await this.$functions('chat-service/send-message', { chatId: this.chatId, message: this.message })
          this.message = ''
        } catch (e) {
          console.error(e)
        }
        this.sendingMessage = false
        this.$nextTick(() => {
          this.$refs.messageBox.focus()
        });
      },

      onScroll(event) {
        // todo when user scroll, don't auto-scroll to bottom
        // console.log(event.target.scrollTop, event.target.scrollHeight, event)
      },

      scrollToBottom() {
        this.$nextTick(() => {
          const container = this.$refs.chatContainer
          container.scrollTop = 10000
        });
      }
    }
  }
</script>

<style scoped>
  .message-input-area {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .chat-container {
    box-sizing: border-box;
    height: calc(100vh - 12rem);
    overflow-y: auto;
    padding: 0;
  }

  .message {
    margin-bottom: 3px;
  }

  /*noinspection CssUnusedSymbol*/
  .message.own {
    text-align: right;
  }

  .message.center {
    text-align: center;
  }

  .message .content {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .message.own .content {
    background-color: rgba(65, 105, 225, 0.5);
  }

  .chat-container .username {
    font-size: 1.2rem;
    cursor: pointer;
  }

  .chat-container .content {
    padding: 8px;
    border-radius: 10px;
    display:inline-block;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12);
    max-width: 50%;
    word-wrap: break-word;
  }
</style>