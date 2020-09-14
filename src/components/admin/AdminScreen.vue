<template>
  <v-container>
    <v-row><h4 class="headline">Admin Functions</h4></v-row>
    <br />

    <v-row>
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

    <v-row v-if="managedPlayer.username">
      <v-row>
        <AppButton
            :disabled="managedPlayer.timerEnd < Date.now()"
            :loading="loading.MANAGE_PLAYER"
            @click="finishTimer()"
        >Finish Timer</AppButton>
      </v-row>
    </v-row>
    <br />

    <v-row>
      <v-row v-if="!needsConfirmation.RESET_DATABASE">
        <AppButton
            :loading="loading.RESET_DATABASE"
            @click="needsConfirmation.RESET_DATABASE = true"
        >Reset Database</AppButton>
      </v-row>

      <v-row v-else>
        <AppButton
            :loading="loading.RESET_DATABASE"
            @click="needsConfirmation.RESET_DATABASE = false"
        >Cancel</AppButton>
        <AppButton
            :loading="loading.RESET_DATABASE"
            @click="resetDatabase()"
        >Confirm Reset Database</AppButton>
      </v-row>
    </v-row>
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
      managedPlayer: {},
      loading: {
        MANAGE_PLAYER: false,
        PLAYER_LIST: false,
        RESET_DATABASE: false
      },
      needsConfirmation: {
        RESET_DATABASE: false,
      }
    }),

    async created() {
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

    methods: {
      async finishTimer() {
        this.loading.MANAGE_PLAYER = true
        await this.$functions('admin-service/finish-player-timer', { managedId: this.managedPlayer.id })
        this.loading.MANAGE_PLAYER = false
      },

      async resetDatabase() {
        this.loading.RESET_DATABASE = true
        await this.$functions('admin-service/reset-world')
        this.needsConfirmation.RESET_DATABASE = false
        this.loading.RESET_DATABASE = false
      }
    }

  }
</script>

<style scoped>

</style>