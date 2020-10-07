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

    <v-row v-if="timeToNextPassiveHp"><span>You will gain 1 HP in {{ timeToNextPassiveHp | duration('humanize') }}.</span></v-row>
    <v-row v-if="timeToFullHp"><span>{{ timeToFullHp | duration('humanize') }} until fully healed.</span></v-row>
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
      gainedHealth: 0,
      timeToFullHp: 0,
      timeToNextPassiveHp: 0
    }),

    computed: {
      currentHealth() {
        const health = this.gainedHealth ? (this.player.restHealth + this.gainedHealth) : this.player.health
        return Math.min(health, this.player.maxHealth)
      },

      isPlayerInFortress() {
        return (this.player.location || '').toLowerCase() === 'fortress oblivion'
      }
    },

    created() {
      this.computeGainedHealth()
    },

    watch: {
      gainedHealth(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          setTimeout(() => this.$functions('actions/no-op', { clientMessage: 'sync passive health gain' }), 10000)
        }
      },

      player: {
        deep: true,
        handler (newVal, oldVal) {
          if (oldVal && newVal !== oldVal) {
            this.computeGainedHealth()
          }
        }
      }
    },

    methods: {
      computeGainedHealth() {
        // passive healing in village
        const location = this.player.location.toLowerCase()
        if (location === 'the village') {
          this.gainedHealth = this.computeGainedHealthOverTime(10, true)
          return
        }

        // passive healing resting in fortress
        const substatus = this.player.substatus.toLowerCase()
        if (location === 'fortress oblivion' && substatus.includes('resting')) {
          const baseTime = substatus.includes('repair bot') ? 65 : 80
          if (this.gainedHealth < 6) {
            this.gainedHealth = Math.min(this.computeGainedHealthOverTime(baseTime + 2 * this.player.level), 6)
          }
          if (this.gainedHealth >= 6) {
            this.timeToNextPassiveHp = 0
          }
          return
        }

        this.gainedHealth = 0
        this.timeToNextPassiveHp = 0
        this.timeToFullHp = 0
      },

      computeGainedHealthOverTime(minutes, includeFullHp = false) {
        const { timerEnd, restHealth, maxHealth } = this.player
        const now = Date.now()
        const timeSinceStartedHealing = now - timerEnd
        const passiveHealMs = minutes * 60 * 1000
        const gainedHealth = Math.max(Math.floor(timeSinceStartedHealing / passiveHealMs), 0)

        if (includeFullHp) {
          this.timeToFullHp = (timerEnd + passiveHealMs * (maxHealth - restHealth)) - now
        }

        const timeToNext = passiveHealMs - (timeSinceStartedHealing - gainedHealth * passiveHealMs)
        this.timeToNextPassiveHp = timeToNext >= 0 ? timeToNext : 0
        setTimeout(() => this.computeGainedHealth(), timeToNext >= 0 ? 60000 : timeToNext)
        return gainedHealth
      }
    }
  }
</script>

<style scoped>

</style>