<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <h3>{{ player.username }}</h3>
        {{ currentHealth }} / {{ player.maxHealth }} HP
        | {{ player.gold | number('0,0') }} gold
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
      gainedHealth: 0
    }),

    created() {
      this.computeGainedHealth()
    },

    computed: {
      currentHealth() {
        return Math.min(this.player.health + this.gainedHealth, this.player.maxHealth)
      },

      isPlayerInFortress() {
        return (this.player.location || '').toLowerCase() === 'fortress oblivion'
      }
    },

    methods: {
      computeGainedHealth() {
        const computeGainedHealthOverTime = timeAmount => {
          setTimeout(() => this.computeGainedHealth(), 60000)
          return Math.max(Math.floor((Date.now() - this.player.timerEnd) / (timeAmount * 1000)), 0)
        }

        // passive healing in village
        const location = this.player.location.toLowerCase()
        if (location === 'the village') {
          this.gainedHealth = computeGainedHealthOverTime(10)
          return
        }

        // passive healing resting in fortress
        const substatus = this.player.substatus.toLowerCase()
        if (location === 'fortress oblivion' && substatus.indexOf('resting') === 0) {
          const baseTime = substatus.indexOf('repair bot') > -1 ? 65 : 80
          this.gainedHealth = Math.min(computeGainedHealthOverTime(baseTime + 2 * this.player.level), 6)
          return
        }

        this.gainedHealth = 0
      },
    }
  }
</script>

<style scoped>

</style>