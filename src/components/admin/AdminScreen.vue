<template>
  <v-container>
    <v-row><h4 class="headline">Admin Functions</h4></v-row>

    <v-row>
      <v-select
        class="settings-select"
        dark
        multiple
        label="Players to alert"
        v-model="playersToMessage"
        :items="allPlayers"
        item-text="username"
        item-value="id"
        return-object
        single-line
        dense
      >
        <template v-slot:prepend-item>
          <v-list-item ripple @click="toggleAllPlayersToMessage()">
            <v-list-item-action>
              <v-icon :color="playersToMessage.length > 0 ? 'red darken-3' : ''">{{ selectAllPlayersToMessageIcon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Select All</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
        </template>

      </v-select>
    </v-row>

    <v-row><v-text-field dark v-model="alertToPlayers" label="Alert to players"></v-text-field></v-row>

    <v-row>
      <AppButton
        :disabled="!alertToPlayers || !playersToMessage.length"
        :loading="loading.SENDING_ALERT"
        @click="sendMessageToPlayers()"
      >Message Players</AppButton>
    </v-row>

    <v-row class="mt-5">
      <v-select
        dark
        label="Manage Player"
        :items="allPlayers"
        item-text="username"
        item-value="id"
        v-model="managedPlayer"
        return-object
      ></v-select>
    </v-row>
    <br />

    <template v-if="managedPlayer.username">
      <v-row class="mb-5">
        <AppButton
            :disabled="managedPlayer.timerEnd < Date.now()"
            :loading="loading.MANAGE_PLAYER"
            @click="finishTimer()"
        >Finish Timer</AppButton>
      </v-row>

      <v-row v-if="!needsConfirmation.DELETE_PLAYER">
        <AppButton
            :loading="loading.MANAGE_PLAYER"
            @click="needsConfirmation.DELETE_PLAYER = true"
        >Delete Player</AppButton>
      </v-row>

      <template v-else>
        <v-row class="mb-5">
          <AppButton
              :loading="loading.MANAGE_PLAYER"
              @click="needsConfirmation.DELETE_PLAYER = false"
          >Cancel</AppButton>
        </v-row>
        <v-row>
          <AppButton
              :loading="loading.MANAGE_PLAYER"
              @click="deletePlayer()"
          >Confirm Delete Player</AppButton>
        </v-row>
      </template>
    </template>

    <br />
    <br />
    <br />
    <v-divider></v-divider>
    <br />
    <br />
    <br />

    <v-row>
      <v-select
          dark
          label="Resolve Dispute"
          :items="disputedEncounters"
          item-text="desc"
          item-value="id"
          v-model="managedEncounter"
          return-object
      ></v-select>
    </v-row>
    <br />

    <template v-if="managedEncounter.id">
      <v-row>
        <v-spacer></v-spacer>
        <v-flex xs12 sm4>
          <v-select
              dark
              label="Winner"
              :items="encounterPlayerList"
              item-text="username"
              item-value="id"
              v-model="winnerId"
          ></v-select>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs12 sm4>
          <v-text-field
              dark
              outlined
              v-model="authDiff"
              label="Authority Difference"
          ></v-text-field>
        </v-flex>
        <v-spacer></v-spacer>
      </v-row>
      <v-row class="mb-5">
        <AppButton
            :disabled="!authDiff || !winnerId"
            :loading="loading.MANAGE_ENCOUNTER"
            @click="resolveDispute()"
        >Resolve Dispute</AppButton>
      </v-row>
    </template>

    <br />
    <br />
    <br />
    <v-divider></v-divider>
    <br />
    <br />
    <br />

    <template>
      <v-row v-if="!needsConfirmation.RESET_DATABASE">
        <AppButton
            :loading="loading.RESET_DATABASE"
            @click="needsConfirmation.RESET_DATABASE = true"
        >Reset Database</AppButton>
      </v-row>

      <template v-else>
        <v-row class="mb-5">
          <AppButton
              :loading="loading.RESET_DATABASE"
              @click="needsConfirmation.RESET_DATABASE = false"
          >Cancel</AppButton>
        </v-row>
        <v-row>
          <AppButton
              :loading="loading.RESET_DATABASE"
              @click="resetDatabase()"
          >Confirm Reset Database</AppButton>
        </v-row>
      </template>
    </template>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'

  export default {
    name: 'AdminScreen',
    components: {
      AppButton
    },

    data: () => ({
      allPlayers: [],
      playersToMessage: [],
      alertToPlayers: '',
      managedPlayer: {},
      disputedEncounters: [],
      managedEncounter: {},
      winnerId: '',
      authDiff: 0,
      loading: {
        ENCOUNTER_LIST: false,
        MANAGE_ENCOUNTER: false,
        MANAGE_PLAYER: false,
        PLAYER_LIST: false,
        RESET_DATABASE: false,
        SENDING_ALERT: false,
      },
      needsConfirmation: {
        DELETE_PLAYER: false,
        RESET_DATABASE: false,
      }
    }),

    async created() {
      await Promise.all([
          this.loadDisputedEncounterList(),
          this.loadPlayerList(),
      ])
    },

    computed: {
      encounterPlayerList() {
        return [this.managedEncounter.player1, this.managedEncounter.player2]
      },

      areAllPlayersToMessageSelected() {
        return this.playersToMessage.length === this.allPlayers.length
      },

      areSomePlayersToMessageSelected() {
        return this.playersToMessage.length > 0 && !this.areAllPlayersToMessageSelected
      },

      selectAllPlayersToMessageIcon () {
        if (this.areAllPlayersToMessageSelected) return 'mdi-close-box'
        if (this.areSomePlayersToMessageSelected) return 'mdi-minus-box'
        return 'mdi-checkbox-blank-outline'
      },
    },

    methods: {
      toggleAllPlayersToMessage() {
        this.$nextTick(() => {
          this.playersToMessage = this.areAllPlayersToMessageSelected ? [] : this.allPlayers.slice()
        })
      },

      async deletePlayer() {
        if (!this.needsConfirmation.DELETE_PLAYER) return
        this.loading.MANAGE_PLAYER = true
        await this.$functions('admin-service/delete-player', { managedId: this.managedPlayer.id })
        this.needsConfirmation.DELETE_PLAYER = false
        this.loading.MANAGE_PLAYER = false
      },

      async finishTimer() {
        this.loading.MANAGE_PLAYER = true
        await this.$functions('admin-service/finish-player-timer', { managedId: this.managedPlayer.id })
        this.loading.MANAGE_PLAYER = false
      },

      getEncounterString(encounterData) {
        const { player1Id, player1, player2, result, format, playPace, start, end, winner, loser } = encounterData
        const formatDate = (time) => this.$moment(time).format('MM/DD/YYYY')
        const didPlayer1Win = player1Id === winner
        const winnerName = didPlayer1Win ? player1.username : player2.username
        const loserName = didPlayer1Win ? player2.username : player1.username
        return `${winnerName} over ${loserName} by ${result}; ${format}; ${playPace}; ${formatDate(start)} - ${formatDate(end)}`
      },

      async loadDisputedEncounterList() {
        this.loading.ENCOUNTER_LIST = true
        await this.$firebase.firestore()
            .collection('world')
            .doc('state')
            .collection('encounters')
            .where('resultDisputed', '==', true)
            .onSnapshot(encounters => {
              const encounterList = []
              encounters.forEach(e => {
                const data = e.data()
                if (!data.disputeResolvedBy) {
                  encounterList.push({
                    ...data,
                    id: e.id,
                    desc: this.getEncounterString(data)
                  })
                }
              })
              this.disputedEncounters = encounterList
            })
        this.loading.ENCOUNTER_LIST = false
      },

      async loadPlayerList() {
        this.loading.PLAYER_LIST = true
        await this.$firebase.firestore()
            .collection('users')
            .orderBy('username')
            .onSnapshot(users => {
              const players = []
              users.forEach(u => {
                players.push(u.data())
              })
              this.allPlayers = players
            })
        this.loading.PLAYER_LIST = false
      },

      async resetDatabase() {
        if (!this.needsConfirmation.RESET_DATABASE) return
        this.loading.RESET_DATABASE = true
        await this.$functions('admin-service/reset-world')
        this.needsConfirmation.RESET_DATABASE = false
        this.loading.RESET_DATABASE = false
      },

      async resolveDispute() {
        this.loading.MANAGE_ENCOUNTER = true

        const { player1Id, player2Id } = this.managedEncounter
        const loserId = this.winnerId === player1Id ? player2Id : player1Id

        await this.$functions('admin-service/resolve-dispute', {
          encounterId: this.managedEncounter.id,
          winnerId: this.winnerId,
          loserId,
          result: this.authDiff
        })
        this.loading.MANAGE_ENCOUNTER = false
      },

      async sendMessageToPlayers() {
        this.loading.SENDING_ALERT = true
        await this.$functions('admin-service/send-player-alert', {
          playerIds: this.playersToMessage.map(p => p.id),
          message: this.alertToPlayers
        })
        this.playersToMessage = []
        this.alertToPlayers = ''
        this.loading.SENDING_ALERT = false
      }
    }

  }
</script>

<style scoped>

</style>