<template>
  <v-container>
    <v-row justify="center">
      <h4>{{ player.timerMessage | capitalize({ onlyFirstLetter: true }) }}</h4>
    </v-row>

    <v-row justify="center">
      <div class="text-center ma-12">
        <v-progress-circular
            rotate=270
            size=269
            :value="timerPercent"
            width=5
            color="red darken-3"
        >{{ timeRemaining | duration('humanize') }}</v-progress-circular>
      </div>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'PlayerTiming',

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
        try {
          await this.$functions('actions/generate-options', { clientMessage })
        } catch (e) {
          setTimeout(() => this.callServer('retrying after 10 seconds'), 10000)
        }
      }
    }

  }
</script>

<style scoped>

</style>