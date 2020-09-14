<template>
  <v-layout
      align-center
      justify-center
      fill-height
  >
    <v-flex xs12 sm10 md7 xl5>
      <v-card class="grey--text text--darken-2 mb-3 cursor--default login-width">

        <v-layout
            align-center
            justify-center
            fill-height
            column
        >
          <v-card-title primary-title>
            <FormSignup
                v-if="signup"
                @login-click="signup = false"
            ></FormSignup>
            <FormForgotPassword
                v-else-if="passwordReset"
                @back-click="passwordReset = false"
            ></FormForgotPassword>
            <FormLogin
                v-else
                @signup-click="signup = true"
                @forgot-password-click="passwordReset = true"
            ></FormLogin>
          </v-card-title>

        </v-layout>

        <v-footer class="no-print" color="white" height="16px"></v-footer>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import FormForgotPassword from './FormForgotPassword'
  import FormLogin from './FormLogin'
  import FormSignup from './FormSignup'

  export default {
    name: 'UserLogin',

    components: {
      FormForgotPassword,
      FormLogin,
      FormSignup
    },

    data: () => ({
      signup: false,
      passwordReset: false
    })
  }
</script>

<style scoped>

</style>