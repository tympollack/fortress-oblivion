<template>
  <v-container>
    <v-row justify="center"><h4>{{ player.timerMessage | capitalize({ onlyFirstLetter: true }) }}</h4></v-row>

    <v-row justify="center" class="mt-12">
      <AppProgressCircular :value="timerPercent">{{ timeRemaining | duration('humanize') }}</AppProgressCircular>
    </v-row>
  </v-container>
</template>

<script>
  import AppProgressCircular from '../app/AppProgressCircular'

  export default {
    name: 'PlayerTiming',

    components: {
      AppProgressCircular
    },

    props: {
      player: {
        type: Object,
        required: true
      },
    },

    data: () => ({
      timeRemaining: 0,
      timerPercent: 0
    }),

    created() {
      this.computeTimeRemaining()
    },

    methods: {
      computeTimeRemaining() {
        const now = Date.now()
        const { timerEnd, timerLength, timerStart } = this.player
        this.timerPercent = Math.min((now - timerStart) / 1000 / timerLength * 100, 100)
        this.timeRemaining = Math.max(timerEnd - now, 0)
        this.timeRemaining
            ? setTimeout(() => this.computeTimeRemaining(), this.timeRemaining < 300000 ? 1000 : 60000)
            : setTimeout(() => this.callServer('timer action complete at ' + now), 777)
      },

      async callServer(clientMessage) {
        const res = await this.$functions('actions/generate-options', { clientMessage })
        const { error } = res.data
        if (error) {
          console.error('encountered an error calling the service, retrying in 10 seconds', error)
          setTimeout(() => this.callServer('retrying after 10 seconds'), 10000)
        }
      }
    }

  }
</script>

<style scoped>

</style>