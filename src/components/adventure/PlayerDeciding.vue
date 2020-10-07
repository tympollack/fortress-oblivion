<template>
  <v-container>
    <v-row justify="center"><h4>{{ player.optionsTitle | capitalize({ onlyFirstLetter: true }) }}</h4></v-row>
    <AppErrorMessage :message="errorMessage"></AppErrorMessage>
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
  import AppErrorMessage from '../app/AppErrorMessage'

  export default {
    name: 'PlayerDeciding',

    components: {
      AppButton,
      AppErrorMessage
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