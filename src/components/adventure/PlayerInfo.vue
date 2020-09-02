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

    data: () => ({
      currentHealth: null
    }),

    created() {
      this.computeCurrentHealth()
    },

    computed: {
      isPlayerInFortress() {
        return this.player.location.toLowerCase() === 'fortress oblivion'
      }
    },

    methods: {
      computeCurrentHealth() {
        const computeGainedHealthOverTime = timeAmount => {
          setTimeout(() => this.computeCurrentHealth(), 60000)
          return Math.max(Math.floor((Date.now() - this.player.timerEnd) / (timeAmount * 1000)), 0)
        }

        let gainedHealth = 0
        const location = this.player.location.toLowerCase()
        const substatus = this.player.substatus.toLowerCase()

        if (location === 'the village') {
          // passive healing in village
          gainedHealth = computeGainedHealthOverTime(10)
        } else if (location === 'fortress oblivion') {
          if (substatus.indexOf('resting') === 0) {
            const isUsingRepairBot = substatus.indexOf('repair bot') > -1
            gainedHealth = Math.min(computeGainedHealthOverTime((isUsingRepairBot ? 65 : 80) + 2 * this.player.level), 6)
          }
        }

        this.currentHealth = Math.min(this.player.health + gainedHealth, this.player.maxHealth)
      },
    }
  }
</script>

<style scoped>

</style>