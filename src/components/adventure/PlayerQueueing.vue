<template>
  <v-container>

    <v-row justify="center"><h4 style="margin: 7px 0;">Finding game...</h4></v-row>
    <v-row justify="center"><h5>Elapsed time: {{ elapsedTime | duration('humanize') }}</h5></v-row>
    <br />
    <v-row v-if="!disabled">
      <AppButton
          :disabled="disabled"
          :loading="loading"
          @click="abandonQueue()"
      >abandon queue</AppButton>
    </v-row>

  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'

  export default {
    name: 'PlayerQueueing',

    components: {
      AppButton
    },

    data: () => ({
      disabled: false,
      elapsedTime: 0,
      loading: false,
    }),

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    created() {
      this.computeElapsedTime()
      setTimeout(() => this.disabled = false, 6660)
    },

    methods: {
      async abandonQueue() {
        this.loading = true
        try {
          await this.$functions('actions/abandon-queue')
        } catch(e) {
          console.error(e)
        }
        this.loading = false
        this.disabled = true
      },

      computeElapsedTime() {
        setTimeout(() => this.computeElapsedTime(), 60000)
        this.elapsedTime = Date.now() - this.player.queuedSince
      }
    }
  }
</script>

<style scoped>

</style>