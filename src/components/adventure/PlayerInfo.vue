<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h3>{{ player.username }}</h3>
        {{ player.health }} / {{ player.maxHealth }} HP
        | {{ player.gold }} gold
        <span v-if="player.hasKey">| +key</span>
        <span v-if="player.potion">| {{ player.potion }} HP potion</span>
      </v-flex>

      <v-flex xs12>
        <h4>{{ player.location | capitalize }}</h4>
        <span v-if="isPlayerInFortress">{{ player.level | ordinal({ includeNumber: true }) }} Floor</span>
      </v-flex>

      <v-flex v-if="player.equipment" xs12>
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
      isPlayerInFortress() {
        return this.player.location.toLowerCase() === 'fortress oblivion'
      }
    },
  }
</script>

<style scoped>

</style>