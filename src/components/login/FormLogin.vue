<template>
  <div>
    <h3 class="headline mb-0 text-xs-center">
      Login or <a @click="$emit('signup-click')">Sign Up</a>
    </h3>
    <v-layout row wrap>
      <v-flex xs12>
        <h4 class="headline text-xs-center">{{ errorMessage }}</h4>
      </v-flex>
      <v-flex xs12>
        <v-text-field
            v-model="email"
            label="Email"
        ></v-text-field>
      </v-flex>
      <v-flex xs12>
        <v-text-field
            v-model="password"
            :append-icon="showPass ? 'visibility' : 'visibility_off'"
            :type="showPass ? 'text' : 'password'"
            label="Password"
            @click:append="showPass = !showPass"
        ></v-text-field>
      </v-flex>
      <v-flex xs6>
        <a @click="loginEmail">Login</a>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  export default {
    name: 'FormLogin',

    data: () => ({
      email: null,
      password: null,
      showPass: false,
      errorMessage: '',
    }),

    methods: {
      loginEmail: async function () {
        try {
          await this.$firebase.auth().signInWithEmailAndPassword(this.email, this.password)
          const user = this.$firebase.auth().currentUser
          if (user && !user.emailVerified) {
            this.errorMessage = 'This email address has not yet been verified.'
            this.password = null
          }
        } catch (e) {
          console.error(e.message)
          this.errorMessage = e.message
          this.password = null
        }
      },
    }
  }
</script>

<style scoped>

</style>