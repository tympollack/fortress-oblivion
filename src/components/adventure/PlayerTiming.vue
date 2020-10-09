<template>
  <v-container>
    <v-row justify="center"><h4>{{ player.timerMessage | capitalize({ onlyFirstLetter: true }) }}</h4></v-row>
    <v-row class="mt-2" v-if="!needsConfirmation">
      <AppButton
        :disabled="disabled"
        :loading="loading"
        @click="needsConfirmation = true"
      >abandon task</AppButton>
    </v-row>

    <template v-else>
      <v-row class="mt-2">
        <AppButton
          :disabled="disabled"
          :loading="loading"
          @click="cancelTask()"
        >confirm abandon task</AppButton>
      </v-row>
      <v-row class="mt-2">
        <AppButton
          :disabled="disabled"
          :loading="loading"
          @click="needsConfirmation = false"
        >mistakes were made</AppButton>
      </v-row>
    </template>

    <v-row justify="center" class="mt-2">
      <AppProgressCircular :value="timerPercent">{{ timeRemaining | duration('humanize') }}</AppProgressCircular>
    </v-row>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'
  import AppProgressCircular from '../app/AppProgressCircular'

  export default {
    name: 'PlayerTiming',

    components: {
      AppButton,
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
      timerPercent: 0,
      disabled: false,
      loading: false,
      needsConfirmation: false,
      timeout: null
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
        this.timeout = this.timeRemaining
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
      },

      async cancelTask() {
        this.loading = true
        clearTimeout(this.timeout)
        const res = await this.$functions('actions/cancel-task')
        const { error } = res.data
        this.errorMessage = error ? error : ''
        if (!error) {
          this.$emit('action-taken')
        }
        this.loading = false
        this.disabled = true
        this.needsConfirmation = false
        await this.callServer('timer action cancelled')
      },

    }

  }
</script>

<style scoped>

</style>