<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h4>{{ player.optionsTitle | capitalize({ onlyFirstLetter: true }) }}</h4>
      </v-flex>

      <v-flex
          xs12
          v-if="!loading"
          v-for="(option, i) in player.options">
        <v-btn
            dark
            block
            tile
            x-large
            @click="optionClick(i)"
        >
          {{ option.heading | capitalize({ onlyFirstLetter: true }) }} <br/>
          {{ option.subheading }}
        </v-btn>
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

    data: () => ({
      loading: false
    }),

    methods: {
      async optionClick(optionIndex) {
        this.loading = true
        try {
          await this.$functions(`actions/${this.player.options[optionIndex].apiPath}`)
        } catch(e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>