<template>
  <v-container>
    <v-row><h3>{{ player.username }}</h3></v-row>
    <v-row>{{ currentHealth }} / {{ player.maxHealth }} HP
      | {{ player.gold | number('0,0') }} gold
      <span v-if="player.hasKey">| +key </span>
      <span v-if="player.potion">| {{ player.potion }} HP potion </span>
    </v-row>

    <v-row><h4>{{ player.location | capitalize }}</h4></v-row>
    <v-row v-if="isPlayerInFortress">{{ player.level | ordinal({ includeNumber: true }) }} Floor</v-row>

    <template v-if="(player.equipment || []).length">
      <v-row><h4>Equipment</h4></v-row>
      <v-row v-for="equipment in player.equipment" :key="equipment.type">
        {{ equipment.quantity | pluralize(equipment.type, { includeNumber: true }) | capitalize }}
      </v-row>
    </template>
    <br/>
    <v-row justify="center">
      <v-divider></v-divider>
    </v-row>

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
        const computeGainedHealthOverTime = minutes => {
          setTimeout(() => this.computeGainedHealth(), 60000)
          return Math.max(Math.floor((Date.now() - this.player.timerEnd) / (minutes * 60 * 1000)), 0)
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