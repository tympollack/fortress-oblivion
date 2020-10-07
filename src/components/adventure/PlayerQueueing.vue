<template>
  <v-container>

    <v-row justify="center"><h4 style="margin: 7px 0;">Finding game...</h4></v-row>
    <v-row justify="center"><h5>Elapsed time: {{ elapsedTime | duration('humanize') }}</h5></v-row>
    <AppErrorMessage :message="errorMessage"></AppErrorMessage>
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
  import AppErrorMessage from '../app/AppErrorMessage'

  export default {
    name: 'PlayerQueueing',

    components: {
      AppButton,
      AppErrorMessage
    },

    data: () => ({
      disabled: false,
      elapsedTime: 0,
      loading: false,
      errorMessage: ''
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
        const res = await this.$functions('actions/abandon-queue')
        const { error } = res.data
        this.errorMessage = error ? error : ''
        if (!error) {
          this.$emit('action-taken')
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