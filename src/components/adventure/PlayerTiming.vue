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
        const timeSince = Math.floor((Date.now() - this.player.timerStart) / 1000);
        this.timeRemaining = Math.max(this.player.timerLength - timeSince, 0)
        this.timeRemaining
          ? setTimeout(() => this.computeTimeRemaining(), 1000)
          : this.$functions('actions/generate-options')
      }
    }

  }
</script>

<style scoped>

</style>