<template>
  <v-container>
    <v-row justify="center"><h4>{{ player.optionsTitle | capitalize({ onlyFirstLetter: true }) }}</h4></v-row>
    <br />
    <v-row
        v-if="!loading"
        v-for="(option, i) in player.options"
        class="mb-5">
      <AppButton
          :loading="loading"
          :heading="option.heading"
          :subheading="option.subheading"
          @click="optionClick(i)"
      ></AppButton>
    </v-row>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'

  export default {
    name: 'PlayerDeciding',

    components: {
      AppButton
    },

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