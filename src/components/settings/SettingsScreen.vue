<template>
  <v-container>
    <v-row>
      <h4 class="headline">Settings</h4>
    </v-row>

    <v-row class="mt-3">
      Timezone
    </v-row>

    <v-row>
      <TimezonePicker :selected.sync="timezone"></TimezonePicker>
    </v-row>

    <v-row class="mt-3">
      Expansions owned
    </v-row>

    <v-row>
      <v-col v-for="expansion in expansionList" :key="expansion">
        <v-checkbox
            dark
            color="red darken-3"
            class="grey-checkbox ma-0 pa-0"
            v-model="expansionsSelected"
            :label="expansion"
            :value="expansion"
        ></v-checkbox>
      </v-col>
    </v-row>

    <v-row>
      <AppButton
          :loading="loading"
          @click="save()"
      >Save</AppButton>
    </v-row>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'
  import TimezonePicker from './TimezonePicker'

  export default {
    name: 'SettingsScreen',

    components: {
      AppButton,
      TimezonePicker
    },

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    data: () => ({
      loading: false,
      expansionList: ['W','R','G','1','B','E','H','F','C','2','K','U','A','M','L','N'],
      expansionsSelected: [],
      timezone: ''
    }),

    methods: {
      async save() {
        this.loading = true
        await this.$functions('users/save-settings', {
          id: this.player.id,
          expansionsOwned: this.expansionsSelected.join(''),
          timezone: this.timezone
        })
        this.loading = false
      },
    },

    created() {
      this.expansionsSelected = (this.player.expansionsOwned || '').split('')
      this.timezone = this.player.timezone
    }
  }
</script>

<style>
  .grey-checkbox i {
    color: grey !important;
  }
</style>