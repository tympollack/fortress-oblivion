<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h3>You have encountered {{ opponent }}, FIGHT!</h3>
      </v-flex>

      <v-flex xs12>
        <h5>Opponent</h5>
        <h4>{{ opponent }}</h4>
      </v-flex>

      <v-flex xs12>
        <h5>Format</h5>
        <h4>{{ encounter.format }}</h4>
      </v-flex>

      <v-flex xs12>
        <h5>Pace of play</h5>
        <h4>{{ encounter.playPace }}</h4>
      </v-flex>

      <v-flex xs12>
        <v-text-field
            dark
            v-model="result"
            label="Authority difference"
        ></v-text-field>
      </v-flex>

      <v-flex xs6>
        <v-btn
            dark
            :loading="loading"
            @click=reportResult()
        >Report Result</v-btn>
      </v-flex>
    </v-layout>
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
      loading: false
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
      async reportResult() {
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