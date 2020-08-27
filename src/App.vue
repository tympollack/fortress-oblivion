<template>
  <v-app v-cloak>
    <v-container>
      <div v-if="userId === ''" />
      <UserLogin v-else-if="!userId" />
      <div v-else>user logged in</div>
    </v-container>
  </v-app>
</template>

<script>
  import UserLogin from './components/login/UserLogin'
  import firebase from './config/firebase'

  export default {
    name: "App",

    components: {
      UserLogin
    },

    data: () => ({
      userId: ''
    }),

    created: function() {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          if (user.emailVerified) this.userId = user.uid
          else firebase.auth().signOut().then()
        }
        else this.userId = null
      })
    }
  }
</script>

<style scoped>

</style>