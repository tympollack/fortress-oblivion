<template>
  <v-layout row wrap>
    <v-flex xs12>
      <p>To enter the Fortress Oblivion, you must present a Star Realms username.</p>
      <h4 class="headline text-xs-center">{{ errorMessage }}</h4>
    </v-flex>

    <v-flex xs12>
      <v-text-field
          v-model="username"
          label="Star Realms IGN"
      ></v-text-field>
    </v-flex>

    <v-flex xs6>
      <v-btn
          dark
          :loading="loading"
          @click="createUser()"
      >Submit</v-btn>
    </v-flex>
  </v-layout>
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