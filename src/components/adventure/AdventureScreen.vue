<template>
  <div>
    <div v-if="!player.id"></div>

    <UsernamePrompt v-else-if="!player.username"></UsernamePrompt>

    <div v-else-if="player.status === STATUS.ABOUT">
      <AboutScreen></AboutScreen>
      <v-btn
          dark
          block
          tile
          x-large
          :loading="loading"
          @click="markManualRead"
      >Got it</v-btn>
    </div>

    <div v-else>
      <PlayerInfo :player="player"></PlayerInfo>

      <PlayerBanking
          v-if="player.status === STATUS.BANKING"
          :player="player"
      ></PlayerBanking>
      <PlayerDeciding
          v-else-if="player.status === STATUS.DECIDING"
          :player="player"
      ></PlayerDeciding>
      <PlayerFighting
          v-else-if="player.status === STATUS.FIGHTING"
          :player="player"
      ></PlayerFighting>
      <PlayerQueueing
          v-else-if="player.status === STATUS.QUEUEING"
          :player="player"
      ></PlayerQueueing>
      <PlayerTiming
          v-else-if="player.status === STATUS.TIMING"
          :player="player"
      ></PlayerTiming>
    </div>
  </div>
</template>

<script>
  import AboutScreen from '../about/AboutScreen'
  import PlayerBanking from './PlayerBanking'
  import PlayerDeciding from './PlayerDeciding'
  import PlayerFighting from './PlayerFighting'
  import PlayerInfo from './PlayerInfo'
  import PlayerQueueing from './PlayerQueueing'
  import PlayerTiming from './PlayerTiming'
  import UsernamePrompt from './UsernamePrompt'

  export default {
    name: 'AdventureScreen',

    components: {
      AboutScreen,
      PlayerBanking,
      PlayerDeciding,
      PlayerFighting,
      PlayerInfo,
      PlayerQueueing,
      PlayerTiming,
      UsernamePrompt
    },

    props: {
      player: {
        type: Object,
        required: true
      },
    },

    data: () => ({
      STATUS: {
        ABOUT: 'about',
        BANKING: 'banking',
        DECIDING: 'deciding',
        FIGHTING: 'fighting',
        QUEUEING: 'queueing',
        TIMING: 'timing',
      },
      loading: false
    }),

    methods: {
      async markManualRead() {
        this.loading = true
        try {
          await this.$functions('actions/read-manual')
        } catch(e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>