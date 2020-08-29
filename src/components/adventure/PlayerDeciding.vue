<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h4>{{ player.optionsTitle | capitalize({ onlyFirstLetter: true }) }}</h4>
      </v-flex>

      <v-flex xs12 v-for="(option, i) in player.options">
        <v-btn
            block
            tile
            x-large
            @click="optionClick(i)"
        >{{ option.description | capitalize({ onlyFirstLetter: true }) }}</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'PlayerDeciding',

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    methods: {
      optionClick(optionIndex) {
        this.$functions(`actions/${this.player.options[optionIndex].apiPath}`)
      }
    }
  }
</script>

<style scoped>

</style>