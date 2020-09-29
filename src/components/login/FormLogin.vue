<template>
  <div>
    <h3 class="headline mb-0 text-xs-center">Login or <a @click="$emit('signup-click')">Sign Up </a></h3>
    <h6><a @click="$emit('forgot-password-click')">(forgot password)</a></h6>
    <v-layout row wrap>
      <v-flex xs12>
        <h4 class="headline text-xs-center">{{ errorMessage }}</h4>
      </v-flex>

      <v-flex xs12>
        <v-form
            ref="form"
            v-model="valid"
            lazy-validation
        >

          <v-text-field
              v-model="email"
              inputmode="email"
              :rules="[rules.required, rules.email]"
              label="Email"
              @keyup.enter="loginEmail()"
          ></v-text-field>

          <v-text-field
              v-model="password"
              :rules="[rules.required]"
              :append-icon="showPass ? 'visibility' : 'visibility_off'"
              :type="showPass ? 'text' : 'password'"
              label="Password"
              @click:append="showPass = !showPass"
              @keyup.enter="loginEmail()"
          ></v-text-field>
        </v-form>
      </v-flex>

      <v-flex xs6>
        <v-btn
            dark
            :loading="loading"
            @click="loginEmail"
        >Login</v-btn>
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
      rules: {
        required: v => !!v || 'Required',
        email: v => /.+@.+\..+/.test(v) || 'E-mail must be in valid format',
      },
      valid: true,
      loading: false
    }),

    methods: {
      validateForm () {
        this.$refs.form.validate()
      },

      loginEmail: async function () {
        this.validateForm()
        if (!this.valid) return

        this.loading = true
        try {
          await this.$firebase.auth().signInWithEmailAndPassword(this.email.trim(), this.password)
          const user = this.$firebase.auth().currentUser
          if (user && !user.emailVerified) {
            this.errorMessage = 'This email address has not yet been verified.'
            this.password = null
          }
        } catch (e) {
          this.errorMessage = e.message
          this.password = null
        }
        this.loading = false
      },
    }
  }
</script>

<style scoped>

</style>