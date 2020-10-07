<template>
  <v-container>
    <v-row><p>To enter the Fortress Oblivion, you must present a Star Realms username.</p></v-row>
    <AppErrorMessage :message="errorMessage"></AppErrorMessage>
    <br />

    <v-row><v-text-field dark autocomplete="off" v-model="username" label="Star Realms IGN"></v-text-field></v-row>

    <br />
    <v-row>
      <AppButton
          :loading="loading"
          @click="createUser()"
      >Submit</AppButton>
    </v-row>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'
  import AppErrorMessage from '../app/AppErrorMessage'

  export default {
    name: 'UsernamePrompt',

    components: {
      AppButton,
      AppErrorMessage
    },

    data: () => ({
      errorMessage: null,
      username: null,
      loading: false
    }),

    methods: {
      async createUser() {
        this.loading = true
        this.errorMessage = ''
        try {
          const userExistenceResponse = await this.$firebase.functions().httpsCallable(`api/users/exists/${this.username}`)()
          if (userExistenceResponse.data) {
            this.errorMessage = 'Username taken.'
            this.loading = false
            return
          }

          const res = await this.$functions('users/', { username: this.username })
          const { error } = res.data
          this.errorMessage = error ? error : ''
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>