<template>
  <v-snackbar
    v-model="value"
    color="red darken-3"
    top
    timeout=-1
    app
  >
    {{ player.playerAlert }}

    <template v-slot:action="{ attrs }">
      <v-btn
        dark
        text
        v-bind="attrs"
        @click="markPlayerAlertSeen()"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
  export default {
    name: 'PlayerAlert',

    props: {
      player: {
        type: Object,
        required: true
      },

      value: Boolean
    },

    methods: {
      markPlayerAlertSeen() {
        this.$functions('actions/see-alert')
      }
    }
  }
</script>

<style scoped>

</style>