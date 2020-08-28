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
      <v-btn @click="createUser()">Submit</v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'UsernamePrompt',

    data: () => ({
      errorMessage: null,
      username: null
    }),

    methods: {
      async createUser() {
        const userExistenceResponse = await this.$firebase.functions().httpsCallable(`api/users/exists/${this.username}`)()
        if (userExistenceResponse.data) {
          this.errorMessage = 'Username taken.'
          return
        }

        await this.$firebase.functions().httpsCallable(`internal/users/`)({
          id: this.$firebase.auth().currentUser.uid,
          username: this.username
        })
      }
    }
  }
</script>

<style scoped>

</style>