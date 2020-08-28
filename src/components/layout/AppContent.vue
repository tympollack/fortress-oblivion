<template>
  <v-container class="wrapper ma-0 pa-0">
    <MenuBar
        @about-click="changeScreen(SCREENS.ABOUT)"
    ></MenuBar>

    <v-layout class="display-area">
  <!--  i know there's a better way to do this, but i forget right now, so this is temp solution  -->
      <AboutScreen v-if="screen === SCREENS.ABOUT"></AboutScreen>
      <AdventureScreen v-else-if="screen === SCREENS.ADVENTURE"></AdventureScreen>
      <ChatScreen v-else-if="screen === SCREENS.CHAT"></ChatScreen>
      <ChronicleScreen v-else-if="screen === SCREENS.CHRONICLE"></ChronicleScreen>
    </v-layout>

    <BottomNav
        :value="makeNullWhenNotBotNavScreen"
        @adventure-click="changeScreen(SCREENS.ADVENTURE)"
        @chat-click="changeScreen(SCREENS.CHAT)"
        @chronicle-click="changeScreen(SCREENS.CHRONICLE)"
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
      SCREENS: {
        ABOUT: 'about',
        ADVENTURE: 'adventure',
        CHAT: 'chat',
        CHRONICLE: 'chronicle',
      },
      screen: 'adventure',
      makeNullWhenNotBotNavScreen: 1
    }),

    components: {
      AboutScreen,
      AdventureScreen,
      BottomNav,
      ChatScreen,
      ChronicleScreen,
      MenuBar
    },

    methods: {
      changeScreen(screen) {
        this.screen = screen

        if ([this.SCREENS.ABOUT].includes(screen)) {
          this.makeNullWhenNotBotNavScreen = 0
        }
      }
    }
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
  }
</style>