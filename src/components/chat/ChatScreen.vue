<template>
  <v-container fluid ma-0 pa-0>

    <ChatLayoutLarge
      class="hidden-sm-and-down"
      :username="player.username"
      :system-channels="systemChannels"
      :pinned-channels="pinnedChannels"
      :other-channels="otherChannels"
      :chat="selectedChat"
      :messages="messages"
      @begin-conversation="onBeginConversation"
      @chat-select="onChatSelect"
    ></ChatLayoutLarge>

    <ChatLayoutSmall
      class="hidden-lg-and-up"
      :username="player.username"
      :system-channels="systemChannels"
      :pinned-channels="pinnedChannels"
      :other-channels="otherChannels"
      :chat="selectedChat"
      :messages="messages"
      @begin-conversation="onBeginConversation"
      @chat-select="onChatSelect"
    ></ChatLayoutSmall>

  </v-container>
</template>

<script>
  import ChatDrawer from './ChatDrawer'
  import ChatLayoutLarge from './ChatLayoutLarge'
  import ChatLayoutSmall from './ChatLayoutSmall'

  export default {
    name: 'ChatScreen',

    components: {
      ChatDrawer,
      ChatLayoutLarge,
      ChatLayoutSmall
    },

    data: () => ({
      messages: [],
      systemChannels: [],
      pinnedChannels: [],
      otherChannels: [],
      selectedChat: {},
      loadingChatList: false,
      loadingChat: false,
    }),

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    created() {
      this.loadChatList()
    },

    methods: {
      async onBeginConversation(recipientId) {
        const res = await this.$functions('chat-service/begin-conversation', { recipientId })
        await this.onChatSelect(res.data)
      },

      async onChatSelect(chat) {
        this.selectedChat = chat
        await this.loadMessages(chat.id)
      },

      async loadChatList() {
        this.loadingChatList = true
        const systemChannels = []
        const pinnedChannels = []
        const otherChannels = []
        const mergeChannels = docs => {
          docs.forEach(d => {
            const data = d.data()
            const list = data.system ? systemChannels : data.pinned ? pinnedChannels : otherChannels
            const { userIds } = data

            let title = data.title
            if (!data.group && userIds && userIds.length === 2) {
              const titleParts = title.split(';')
              title = titleParts[0] === this.player.username ? titleParts[1] : titleParts[0]
            }

            list.push({ ...data, id: d.id, title})
          })
        }

        const chatCollRef = this.$firebase.firestore().collection('chat')
        await Promise.all([
          chatCollRef.where('all', '==', true).onSnapshot(mergeChannels),
          chatCollRef.where('userIds','array-contains', this.player.id).onSnapshot(mergeChannels)
        ])

        this.systemChannels = systemChannels
        this.pinnedChannels = pinnedChannels
        this.otherChannels = otherChannels
        this.loadingChatList = false
      },

      async loadMessages(chatId) {
        this.$firebase.firestore()
            .collection('chat')
            .doc(chatId)
            .collection('messages')
            .orderBy('created', 'asc')
            .onSnapshot(docs => {
              const messages = []
              docs.forEach(d => {
                messages.push(d.data())
              })
              this.messages = messages
            })
      }
    }
  }
</script>

<style scoped>

</style>