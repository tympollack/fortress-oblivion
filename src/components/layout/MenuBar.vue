<template>
  <v-system-bar height="50" dark>
    <v-spacer></v-spacer>
    <v-menu bottom left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            dark
            icon
            v-bind="attrs"
            v-on="on"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="$emit('about-click')">
          <v-list-item-title>About</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout()">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-system-bar>
</template>

<script>
  export default {
    name: 'MenuBar',

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