<template>
  <v-container>
    <v-row><h3>You have encountered {{ opponent }}, FIGHT!</h3></v-row>

    <v-row><h5>Opponent</h5></v-row>
    <v-row><h4>{{ opponent }}</h4></v-row>

    <v-row><h5>Format</h5></v-row>
    <v-row><h4>{{ encounter.format }}</h4></v-row>

    <v-row><h5>Pace of play</h5></v-row>
    <v-row><h4>{{ encounter.playPace }}</h4></v-row>

    <v-form
        ref="form"
        v-model="valid"
        lazy-validation
    >
      <v-row>
        <v-text-field
            dark
            v-model="result"
            :rules="[rules.required, rules.integer]"
            label="Authority difference"
        ></v-text-field>
      </v-row>
    </v-form>

    <v-row>
      <v-btn
          dark
          block
          tile
          x-large
          :loading="loading"
          @click=reportResult()
      >Report Result</v-btn>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'PlayerFighting',

    props: {
      player: {
        type: Object,
        required: true
      },
    },

    data: () => ({
      encounter: {},
      result: null,
      loading: false,
      valid: true,
      rules: {
        required: v => !!v || 'Required',
        integer: v => (!isNaN(v) && Number.isInteger(Number(v))) && Number(v) !== 0 || 'Must be a non-zero integer',
      }
    }),

    computed: {
      opponent() {
        return (this.encounter['player' + (this.encounter.player1Id === this.player.id ? '2' : '1')] || {}).username
      },
    },

    created() {
      this.$firebase.firestore()
          .collection('world')
          .doc('state')
          .collection('encounters')
          .doc(this.player.encounterId)
          .onSnapshot(doc => this.encounter = doc.data())
    },

    methods: {
      validateForm () {
        this.$refs.form.validate()
      },

      resetForm () {
        this.$refs.form.reset()
      },

      async reportResult() {
        this.validateForm()
        if (!this.valid) return

        this.loading = true
        try {
          await this.$functions('actions/report-result', { result: this.result })
        } catch(e) {
          console.error(e)
        }
        this.loading = false
      },
    }
  }
</script>

<style scoped>

</style>