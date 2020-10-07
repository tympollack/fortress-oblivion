<template>
  <v-container>
    <AppErrorMessage></AppErrorMessage>
    <AboutScreen></AboutScreen>
    <AppButton
      :loading="loading"
      @click="markManualRead"
    >Got it</AppButton>
  </v-container>
</template>

<script>
  import AboutScreen from '../about/AboutScreen'
  import AppButton from '../app/AppButton'
  import AppErrorMessage from '../app/AppErrorMessage'

  export default {
    name: 'AdventureAbout',

    components: {
      AboutScreen,
      AppButton,
      AppErrorMessage,
    },

    data: () => ({
      loading: false,
    }),

    methods: {
      async markManualRead() {
        this.loading = true
        const res = await this.$functions('actions/read-manual')
        const { error } = res.data
        this.errorMessage = error ? error : ''
        this.loading = false
      },
    }
  }
</script>

<style scoped>

</style>