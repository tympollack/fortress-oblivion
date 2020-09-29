<template>
  <v-container fluid pa-0>
    <MenuBar
        :show-admin="isAdmin"
        @about-click="screen = SCREEN.ABOUT"
        @admin-click="screen = SCREEN.ADMIN"
        @settings-click="screen = SCREEN.SETTINGS"
    ></MenuBar>

    <v-container fluid class="display-area">
      <PlayerAlert :value="showAlert" :player="player"></PlayerAlert>

  <!--  i know there's a better way to do this, but i forget right now, so this is temp solution  -->
      <AboutScreen v-if="screenName === SCREEN.ABOUT.name"></AboutScreen>
      <AdminScreen v-else-if="screenName === SCREEN.ADMIN.name && isAdmin"></AdminScreen>
      <AdventureScreen
          v-else-if="screenName === SCREEN.ADVENTURE.name"
          :player="player"
          :is-player-updated-from-db.sync="isPlayerUpdatedFromDb"
      ></AdventureScreen>
      <ChatScreen
          v-else-if="screenName === SCREEN.CHAT.name"
          :player="player"
      ></ChatScreen>
      <ChronicleScreen v-else-if="screenName === SCREEN.CHRONICLE.name"></ChronicleScreen>
      <SettingsScreen
          v-else-if="screenName === SCREEN.SETTINGS.name"
          :player="player"></SettingsScreen>
    </v-container>

    <BottomNav
        :value="screenNumber"
        @adventure-click="screen = SCREEN.ADVENTURE"
        @chat-click="screen = SCREEN.CHAT"
        @chronicle-click="screen = SCREEN.CHRONICLE"
    ></BottomNav>
  </v-container>
</template>

<script>
  import AboutScreen from '../about/AboutScreen'
  import AdminScreen from '../admin/AdminScreen'
  import AdventureScreen from '../adventure/AdventureScreen'
  import BottomNav from './BottomNav'
  import ChatScreen from '../chat/ChatScreen'
  import ChronicleScreen from '../chronicle/ChronicleScreen'
  import MenuBar from './MenuBar'
  import PlayerAlert from './PlayerAlert'
  import SettingsScreen from '../settings/SettingsScreen'

  export default {
    name: 'AppContent',

    data: () => ({
      SCREEN: {
        ABOUT: { name: 'about', number: 0 },
        ADMIN: { name: 'admin', number: 0 },
        ADVENTURE: { name: 'adventure', number: 1 },
        CHAT: { name: 'chat', number: 3 },
        CHRONICLE: { name: 'chronicle', number: 2 },
        SETTINGS: { name: 'settings', number: 0 },
      },
      screen: { name: 'adventure', number: 1 },
      player: {},
      showAlert: false,
      isPlayerUpdatedFromDb: false
    }),

    components: {
      AboutScreen,
      AdminScreen,
      AdventureScreen,
      BottomNav,
      ChatScreen,
      ChronicleScreen,
      MenuBar,
      PlayerAlert,
      SettingsScreen
    },

    created() {
      const id = this.$firebase.auth().currentUser.uid
      this.$firebase.firestore()
          .collection('users')
          .doc(id)
          .onSnapshot(doc => {

        this.$nextTick(() => {
          this.player = doc.exists ? doc.data() : { id }
          this.showAlert = this.player.playerAlert && !this.player.playerAlertSeen
          this.isPlayerUpdatedFromDb = true
        });
      })
    },

    computed: {
      isAdmin() {
        return this.player.isAdmin || this.player.isGod
      },

      screenName() {
        return this.screen.name
      },

      screenNumber() {
        return this.screen.number
      },
    },
  }
</script>

<style scoped>
  .display-area {
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: 38px !important;
    max-height: calc(94vh - 56px);
  }
</style>