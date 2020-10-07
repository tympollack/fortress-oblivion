<template>
  <v-row>
    <div v-if="!player.id"></div>

    <UsernamePrompt v-else-if="!player.username"></UsernamePrompt>

    <AdventureAbout v-else-if="player.status === STATUS.ABOUT"></AdventureAbout>

    <template v-else>
      <PlayerInfo :player="player"></PlayerInfo>

      <template v-if="isPlayerUpdatedFromDb">
        <PlayerDeciding
          v-if="player.status === STATUS.DECIDING"
          :player="player"
          @action-taken="onActionTaken"
        ></PlayerDeciding>
        <PlayerFighting
          v-else-if="player.status === STATUS.FIGHTING"
          :player="player"
          @action-taken="onActionTaken"
        ></PlayerFighting>
        <PlayerQueueing
          v-else-if="player.status === STATUS.QUEUEING"
          :player="player"
          @action-taken="onActionTaken"
        ></PlayerQueueing>
        <PlayerTiming
          v-else-if="player.status === STATUS.TIMING"
          :player="player"
        ></PlayerTiming>
      </template>

      <AppProgressCircular v-else indeterminate></AppProgressCircular>
    </template>
  </v-row>
</template>

<script>
  import AdventureAbout from './AdventureAbout'
  import AppProgressCircular from '../app/AppProgressCircular'
  import PlayerDeciding from './PlayerDeciding'
  import PlayerFighting from './PlayerFighting'
  import PlayerInfo from './PlayerInfo'
  import PlayerQueueing from './PlayerQueueing'
  import PlayerTiming from './PlayerTiming'
  import UsernamePrompt from './UsernamePrompt'

  export default {
    name: 'AdventureScreen',

    components: {
      AdventureAbout,
      AppProgressCircular,
      PlayerDeciding,
      PlayerFighting,
      PlayerInfo,
      PlayerQueueing,
      PlayerTiming,
      UsernamePrompt
    },

    props: {
      isPlayerUpdatedFromDb: Boolean,
      player: {
        type: Object,
        required: true
      },
    },

    data: () => ({
      STATUS: {
        ABOUT: 'about',
        DECIDING: 'deciding',
        FIGHTING: 'fighting',
        QUEUEING: 'queueing',
        TIMING: 'timing',
      },
    }),

    methods: {
      onActionTaken() {
        this.$emit('update:isPlayerUpdatedFromDb', false)
      }
    }
  }
</script>

<style scoped>

</style>