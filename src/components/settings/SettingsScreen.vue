<template>
  <v-container>
    <v-row><h4 class="headline">Settings</h4></v-row>
    <AppErrorMessage :message="errorMessage"></AppErrorMessage>

    <v-row><TimezonePicker :selected.sync="timezone"></TimezonePicker></v-row>

    <v-row dark>
      <v-select
          class="settings-select"
          dark
          multiple
          label="Expansions Owned"
          v-model="expansionsSelected"
          :items="expansionList"
      >
        <template v-slot:prepend-item>
          <v-list-item ripple @click="toggleAllExpansions">
            <v-list-item-action>
              <v-icon :color="expansionsSelected.length > 0 ? 'red darken-3' : ''">{{ selectAllExpansionsIcon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Select All</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
        </template>

        <template v-slot:selection="{ item }">
          <span>{{ item }}</span>
        </template>
      </v-select>
    </v-row>

    <br />
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
  import AppErrorMessage from '../app/AppErrorMessage'
  import TimezonePicker from './TimezonePicker'

  export default {
    name: 'SettingsScreen',

    components: {
      AppButton,
      AppErrorMessage,
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
      timezone: '',
      errorMessage: ''
    }),

    computed: {
      areAllExpansionsSelected() {
        return this.expansionsSelected.length === this.expansionList.length
      },

      areSomeExpansionsSelected() {
        return this.expansionsSelected.length > 0 && !this.areAllExpansionsSelected
      },

      selectAllExpansionsIcon () {
        if (this.areAllExpansionsSelected) return 'mdi-close-box'
        if (this.areSomeExpansionsSelected) return 'mdi-minus-box'
        return 'mdi-checkbox-blank-outline'
      },
    },

    methods: {
      async save() {
        this.loading = true
        const res = await this.$functions('users/save-settings', {
          id: this.player.id,
          expansionsOwned: this.expansionsSelected.join(''),
          timezone: this.timezone
        })
        const { error } = res.data
        this.errorMessage = error ? error : ''
        this.loading = false
      },

      toggleAllExpansions() {
        this.$nextTick(() => {
          this.expansionsSelected = this.areAllExpansionsSelected ? [] : this.expansionList.slice()
        })
      },
    },

    created() {
      this.expansionsSelected = (this.player.expansionsOwned || '').split('')
      this.timezone = this.player.timezone
    }
  }
</script>

<style>
</style>