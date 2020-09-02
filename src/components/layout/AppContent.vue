<template>
  <v-container class="wrapper ma-0 pa-0">
    <MenuBar
        @about-click="screen = SCREEN.ABOUT"
    ></MenuBar>

    <v-container class="display-area">
  <!--  i know there's a better way to do this, but i forget right now, so this is temp solution  -->
      <AboutScreen v-if="screen === SCREEN.ABOUT"></AboutScreen>
      <AdventureScreen v-else-if="screen === SCREEN.ADVENTURE"></AdventureScreen>
      <ChatScreen v-else-if="screen === SCREEN.CHAT"></ChatScreen>
      <ChronicleScreen v-else-if="screen === SCREEN.CHRONICLE"></ChronicleScreen>
    </v-container>

    <BottomNav
        :value="screen"
        @adventure-click="screen = SCREEN.ADVENTURE"
        @chat-click="screen = SCREEN.CHAT"
        @chronicle-click="screen = SCREEN.CHRONICLE"
    ></BottomNav>
  </v-container>
</template>

<script>
  import BottomNav from './BottomNav'
  import MenuBar from './MenuBar'
  import AdventureScreen from '../adventure/AdventureScreen'
  import AboutScreen from '../about/AboutScreen'
  import ChatScreen from '../chat/ChatScreen'
  import ChronicleScreen from '../chronicle/ChronicleScreen'

  export default {
    name: 'AppContent',

    data: () => ({
      SCREEN: {
        ABOUT: 0,
        ADVENTURE: 1,
        CHAT: 3,
        CHRONICLE: 2,
      },
      screen: 1,
    }),

    components: {
      AboutScreen,
      AdventureScreen,
      BottomNav,
      ChatScreen,
      ChronicleScreen,
      MenuBar
    },
  }
</script>

<style scoped>
  .wrapper {
    border: 1px solid darkslategrey;
    width: 500px;
    min-height: 500px;
    overflow: hidden;
  }

  .display-area {
    min-height: 444px;
    overflow-y: auto;
    background: #272727;
    color: lightgrey;
  }
</style>