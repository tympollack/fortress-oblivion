<template>
  <v-container>
    <v-layout
        text-xs-center
        wrap
    >
      <v-flex xs12>
        <v-btn @click="logout">Logout</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'AppContent',

    methods: {
      logout: async function() {
        try {
          await this.$firebase.auth().signOut()
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
</script>

<style scoped>

</style>