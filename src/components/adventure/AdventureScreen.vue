<template>
  <div v-if="!player">
    <UsernamePrompt v-if="needUsername"></UsernamePrompt>
  </div>
  <div v-else-if="player.status === STATUS.ABOUT">
    <AboutScreen></AboutScreen>
    <v-btn @click="markManualRead">Got it</v-btn>
  </div>
  <div v-else>
    <PlayerInfo :player="player"></PlayerInfo>

    <PlayerDeciding v-if="player.status === STATUS.DECIDING"></PlayerDeciding>
    <PlayerFighting v-else-if="player.status === STATUS.FIGHTING"></PlayerFighting>
    <PlayerQueueing v-else-if="player.status === STATUS.QUEUEING"></PlayerQueueing>
    <PlayerTimer v-else-if="player.status === STATUS.TIMING"></PlayerTimer>
  </div>
</template>

<script>
  import AboutScreen from '../about/AboutScreen'
  import PlayerDeciding from './PlayerDeciding'
  import PlayerFighting from './PlayerFighting'
  import PlayerInfo from './PlayerInfo'
  import PlayerQueueing from './PlayerQueueing'
  import PlayerTimer from './PlayerTimer'
  import UsernamePrompt from './UsernamePrompt'

  export default {
    name: 'AdventureScreen',

    components: {
      AboutScreen,
      PlayerDeciding,
      PlayerFighting,
      PlayerInfo,
      PlayerQueueing,
      PlayerTimer,
      UsernamePrompt
    },

    data: () => ({
      STATUS: {
        ABOUT: 'about',
        DECIDING: 'deciding',
        FIGHTING: 'fighting',
        QUEUEING: 'queueing',
        TIMING: 'timing',
      },
      player: null,
      needUsername: false
    }),

    created() {
      const userId = this.$firebase.auth().currentUser.uid
      this.$firebase.firestore().collection('users').doc(userId).onSnapshot(doc => {
        if (doc.exists) {
          this.player = doc.data()
        } else {
          this.needUsername = true
        }
      })
    },

    methods: {
      markManualRead() {
        this.$functions('actions/read-manual')
      }
    }
  }
</script>

<style scoped>

</style>