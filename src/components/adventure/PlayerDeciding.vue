<template>
  <v-container>
    <v-row justify="center">
      <v-flex xs12 style="margin-bottom:20px;">
        <v-divider></v-divider>
        <h4 style="margin: 7px 0; text-align: center">{{ player.optionsTitle | capitalize({ onlyFirstLetter: true }) }}</h4>
        <v-divider></v-divider>
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
    </v-row>
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
        setTimeout(() => this.loading = false, 777)
      }
    }
  }
</script>

<style scoped>

</style>