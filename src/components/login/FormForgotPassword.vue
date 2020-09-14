<template>
  <div>
    <h3 class="headline mb-0 text-xs-center">
      <a @click="$emit('back-click')">Back to Login</a>
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
              @keyup.enter="sendPasswordReset()"
          ></v-text-field>

        </v-form>
      </v-flex>

      <v-flex xs6>
        <v-btn
            dark
            :loading="loading"
            @click="sendPasswordReset"
        >Send Password Reset Email</v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  export default {
    name: 'FormForgotPassword',

    data: () => ({
      email: null,
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

      sendPasswordReset: async function () {
        this.validateForm()
        if (!this.valid) return

        this.loading = true
        try {
          this.$firebase.auth().useDeviceLanguage()
          await this.$firebase.auth().sendPasswordResetEmail(this.email.trim())
          this.errorMessage = `A password reset email was sent to ${this.email}.`
          this.email = ''
        } catch (e) {
          this.errorMessage = e.message
        }
        this.loading = false
      },
    }
  }
</script>

<style scoped>

</style>