<template>
  <v-app class="app" v-cloak>
    <v-container fluid>
      <div v-if="userId === ''" /> <!--  //todo show a something waiting for auth call  -->
      <UserLogin v-else-if="!userId" />
      <AppContent v-else></AppContent>
    </v-container>
  </v-app>
</template>

<script>
  import AppContent from './components/layout/AppContent'
  import UserLogin from './components/login/UserLogin'
  import firebase from './config/firebase'

  export default {
    name: "App",

    components: {
      AppContent,
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
  .app {
    background-color: #182026;
    color: lightgrey;
  }
</style>