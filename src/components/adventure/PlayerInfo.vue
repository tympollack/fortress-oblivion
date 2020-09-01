<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h3>{{ player.username }}</h3>
        {{ currentHealth }} / {{ player.maxHealth }} HP
        | {{ player.gold }} gold
        <span v-if="player.hasKey">| +key </span>
        <span v-if="player.potion">| {{ player.potion }} HP potion </span>
      </v-flex>

      <v-flex xs12>
        <h4>{{ player.location | capitalize }}</h4>
        <span v-if="isPlayerInFortress">{{ player.level | ordinal({ includeNumber: true }) }} Floor</span>
      </v-flex>

      <v-flex v-if="(player.equipment || []).length" xs12>
        <h4>Equipment</h4>
        <div v-for="equipment in player.equipment" :key="equipment.type">
          {{ equipment.quantity | pluralize(equipment.type, { includeNumber: true }) | capitalize }}
        </div>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'PlayerInfo',

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    computed: {
      currentHealth() {
        // healing in village
        let gainedHealth = 0
        if (this.player.location.toLowerCase() === 'the village') {
          gainedHealth = Math.floor((Date.now() - this.player.timerEnd) / 10000)
        }
        return Math.min(this.player.health + gainedHealth, this.player.maxHealth)
      },

      isPlayerInFortress() {
        return this.player.location.toLowerCase() === 'fortress oblivion'
      }
    },
  }
</script>

<style scoped>

</style>