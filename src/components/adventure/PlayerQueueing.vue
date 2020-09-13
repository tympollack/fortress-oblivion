<template>
  <v-container>

    <v-row justify="center"><h4 style="margin: 7px 0;">Finding game...</h4></v-row>
    <v-row justify="center"><h5>Elapsed time: {{ elapsedTime | duration('humanize') }}</h5></v-row>
    <br />
    <v-row>
      <AppButton
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
      elapsedTime: 0,
      loading: false
    }),

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    created() {
      this.computeElapsedTime()
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
      },

      computeElapsedTime() {
        setTimeout(() => this.computeElapsedTime(), 10000)
        this.elapsedTime = Date.now() - this.player.queuedSince
      }
    }
  }
</script>

<style scoped>

</style>