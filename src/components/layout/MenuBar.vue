<template>
  <v-system-bar height="50" dark fixed app>
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
        <v-list-item v-if="showAdmin" @click="$emit('admin-click')">
          <v-list-item-title>Admin</v-list-item-title>
        </v-list-item>
        <v-list-item @click="$emit('about-click')">
          <v-list-item-title>About</v-list-item-title>
        </v-list-item>
        <v-list-item @click="$emit('settings-click')">
          <v-list-item-title>Settings</v-list-item-title>
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

    props: {
      showAdmin: {
        type: Boolean,
        default: false
      }
    },

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

<style>
  html {
    overflow: hidden !important;
  }
</style>