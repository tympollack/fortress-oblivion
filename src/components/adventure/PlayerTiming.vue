<template>
  <div>time remaining: {{ timeRemaining }}</div>
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
      timeRemaining: 0
    }),

    created() {
      this.computeTimeRemaining()
    },

    methods: {
      computeTimeRemaining() {
        const now = Date.now()
        const timeSince = Math.floor((now - this.player.timerStart) / 1000);
        this.timeRemaining = Math.max(this.player.timerLength - timeSince, 0)
        this.timeRemaining
            ? setTimeout(() => this.computeTimeRemaining(), 1000)
            : this.callServer('timer action complete at ' + now)
      },

      callServer(clientMessage) {
        try {
          this.$functions('actions/generate-options', { clientMessage })
        } catch (e) {
          setTimeout(() => this.callServer('retrying after 10 seconds'), 10000)
        }
      }
    }

  }
</script>

<style scoped>

</style>