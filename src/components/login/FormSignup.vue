<template>
  <div>
    <h3 class="headline mb-0 text-xs-center">
      <a @click="$emit('login-click')">Already have an account? Login instead!</a>
    </h3>
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
              :rules="[rules.required, rules.email]"
              label="Email"
              @keyup.enter="signupEmail()"
          ></v-text-field>

          <v-text-field
              v-model="password"
              :rules="[rules.required]"
              :append-icon="showPass ? 'visibility' : 'visibility_off'"
              :type="showPass ? 'text' : 'password'"
              label="Password"
              @click:append="showPass = !showPass"
              @keyup.enter="signupEmail()"
          ></v-text-field>

          <v-text-field
              v-model="password2"
              :rules="[rules.required, passwordMatchRule]"
              :append-icon="showPass2 ? 'visibility' : 'visibility_off'"
              :type="showPass2 ? 'text' : 'password'"
              label="Confirm Password"
              @click:append="showPass2 = !showPass2"
              @keyup.enter="signupEmail()"
          ></v-text-field>

        </v-form>
      </v-flex>

      <v-flex xs6>
        <v-btn
            dark
            :loading="loading"
            @click="signupEmail"
        >Sign me up!</v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  export default {
    name: 'FormSignup',

    data: () => ({
      loading: false,
      valid: true,
      email: null,
      password: null,
      password2: null,
      showPass: false,
      showPass2: false,
      errorMessage: '',
      rules: {
        required: v => !!v || 'Required',
        email: v => /.+@.+\..+/.test(v) || 'E-mail must be in valid format',
      }
    }),

    computed: {
      passwordMatchRule () {
        return this.password === this.password2 || 'Passwords must match'
      }
    },

    methods: {
      validateForm () {
        this.$refs.form.validate()
      },

      resetForm () {
        this.$refs.form.reset()
      },

      signupEmail: async function() {
        this.validateForm()
        if (!this.valid) return

        this.loading = true
        try {
          await this.$firebase.auth().createUserWithEmailAndPassword(this.email.trim(), this.password)
          await this.$firebase.auth().currentUser.sendEmailVerification()
          this.errorMessage = 'Check your email for account verification.'
          this.resetForm()
        } catch(e) {
          console.error(e.message)
          this.errorMessage = e.message
        }
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>