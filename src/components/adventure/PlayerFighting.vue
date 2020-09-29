<template>
  <v-container>
    <v-row class="mb-5"><h3>You have encountered <span class="red--text text--darken-3">{{ opponent }}</span>, FIGHT!</h3></v-row>

    <v-row><h5>Format</h5></v-row>
    <v-row class="mb-5"><h4>{{ encounter.format }}</h4></v-row>

    <v-row><h5>Pace of play</h5></v-row>
    <v-row class="mb-5"><h4>{{ encounter.playPace }}</h4></v-row>

    <v-form
        ref="form"
        v-model="valid"
        lazy-validation
    >
      <v-row>
        <v-spacer></v-spacer>
        <v-flex xs12 sm4>
          <v-text-field
              dark
              outlined
              inputmode="numeric"
              v-model="playerResult"
              :rules="[rules.integer]"
              label="Your Authority"
          ></v-text-field>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs12 sm4>
          <v-text-field
              dark
              outlined
              inputmode="numeric"
              v-model="opponentResult"
              :rules="[rules.integer]"
              :label="`${opponent}'s Authority`"
          ></v-text-field>
        </v-flex>
        <v-spacer></v-spacer>
      </v-row>
    </v-form>

    <v-row class="mt-5">
      <AppButton
          :disabled="!encounterResult"
          :loading="loading"
          @click="reportResult()"
      >Report Result</AppButton>
    </v-row>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'

  export default {
    name: 'PlayerFighting',

    components: {
      AppButton
    },

    props: {
      player: {
        type: Object,
        required: true
      },
    },

    data: () => ({
      encounter: {},
      playerResult: 0,
      opponentResult: 0,
      loading: false,
      valid: true,
      rules: {
        required: v => !!v || 'Required',
        integer: v => (!isNaN(v) && Number.isInteger(Number(v))) || 'Must be an integer',
      }
    }),

    computed: {
      opponent() {
        return (this.encounter['player' + (this.encounter.player1Id === this.player.id ? '2' : '1')] || {}).username
      },

      encounterResult() {
        const isValid = (v) => !isNaN(v) && Number.isInteger(Number(v))
        const { playerResult, opponentResult } = this
        return isValid(playerResult)
            && isValid(opponentResult)
            && (playerResult <= 0 || opponentResult <= 0)
            ? playerResult - opponentResult
            : 0
      }
    },

    async created() {
      this.loading = true
      const encounterDoc = await this.$firebase.firestore()
          .collection('world')
          .doc('state')
          .collection('encounters')
          .doc(this.player.encounterId)
          .get()
      this.encounter = encounterDoc.data()
      this.loading = false
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
        if (!this.valid || !this.encounterResult) return

        this.loading = true
        try {
          await this.$functions('actions/report-result', { result: this.encounterResult })
          this.$emit('action-taken')
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