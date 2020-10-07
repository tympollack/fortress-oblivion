<template>
  <v-container>
    <v-row justify="center"><h4>{{ player.optionsTitle | capitalize({ onlyFirstLetter: true }) }}</h4></v-row>
    <v-row v-if="errorMessage" justify="center">
      <h4>{{ errorMessage | capitalize({ onlyFirstLetter: true }) }}</h4>
    </v-row>
    <br />
    <v-row
        v-if="!loading"
        v-for="(option, i) in player.options"
        class="mb-5">
      <AppButton
          :loading="loading"
          :heading="option.heading"
          :subheading="option.subheading"
          :disabled="option.disabled"
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
      errorMessage: '',
      loading: false
    }),

    methods: {
      async optionClick(optionIndex) {
        this.loading = true
        const res = await this.$functions(`actions/${this.player.options[optionIndex].apiPath}`)
        const { error } = res.data
        this.errorMessage = error ? error : ''
        if (!error) {
          this.$emit('action-taken')
        }
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>