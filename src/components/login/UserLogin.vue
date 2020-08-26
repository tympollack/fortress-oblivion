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
            <FormSignup v-if="signup"
                        @login-click="signup = false"
            />
            <FormLogin v-else
                       @signup-click="signup = true"
            />
          </v-card-title>

          <!--        <v-progress-circular-->
          <!--                v-if="loading"-->
          <!--                color="primary-lighten-1"-->
          <!--                indeterminate-->
          <!--        ></v-progress-circular>-->
          <!--        <template v-else-if="errorMessage">{{ errorMessage }}</template>-->
          <!--        <slot v-else></slot>-->

        </v-layout>

        <v-footer class="no-print"
                  color="white"
                  height="16px"
        >
        </v-footer>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import FormSignup from './FormSignup'
  import FormLogin from './FormLogin'

  export default {
    name: 'UserLogin',

    components: {
      FormLogin,
      FormSignup
    },

    data: () => ({
      signup: false
    })
  }
</script>

<style scoped>

</style>