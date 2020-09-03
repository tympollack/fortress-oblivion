<template>
  <div>
    <div class="chronicle-player pa-2">
      <h3>{{ player.username }} <span v-if="player.status === 'fighting'">fighting</span></h3>
      <div>
        {{ player.level | ordinal({ includeNumber: true }) }} Floor
      </div>
      <div>
        HP {{ player.health }} <span v-if="player.potion"> + potion</span>
        | {{ player.gold }} gold
      </div>
    </div>
    <v-divider></v-divider>
  </div>
</template>

<script>
  export default {
    name: 'ChroniclePlayer',

    props: {
      player: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style scoped>
  .chronicle-player div {
    font-size: .8em
  }

  .chronicle-player:hover {
    background: rgba(244, 67, 54,.2);
  }
</style>