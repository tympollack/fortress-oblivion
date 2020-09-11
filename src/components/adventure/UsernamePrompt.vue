<template>
  <v-container>
    <v-row><p>To enter the Fortress Oblivion, you must present a Star Realms username.</p></v-row>
    <v-row><h4 class="headline text-xs-center">{{ errorMessage }}</h4></v-row>
    <br />

    <v-row><v-text-field dark v-model="username" label="Star Realms IGN"></v-text-field></v-row>

    <br />
    <v-row>
      <v-btn
          dark
          block
          tile
          x-large
          :loading="loading"
          @click="createUser()"
      >Submit</v-btn>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'UsernamePrompt',

    data: () => ({
      errorMessage: null,
      username: null,
      loading: false
    }),

    methods: {
      async createUser() {
        this.loading = true
        try {
          const userExistenceResponse = await this.$firebase.functions().httpsCallable(`api/users/exists/${this.username}`)()
          if (userExistenceResponse.data) {
            this.errorMessage = 'Username taken.'
            this.loading = false
            return
          }

          await this.$functions('users/', { username: this.username })
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