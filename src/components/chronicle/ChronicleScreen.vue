<template>
  <v-row>
    <v-flex xs12 v-for="player in playersInFortress">
      <ChroniclePlayer :player="player"></ChroniclePlayer>
    </v-flex>
  </v-row>
</template>

<script>
  import ChroniclePlayer from './ChroniclePlayer'
  export default {
    name: 'ChronicleScreen',
    components: {ChroniclePlayer},
    data: () => ({
      playersInFortress: []
    }),

    created() {
      this.$firebase.firestore()
          .collection('users')
          .where('location', '==', 'fortress oblivion')
          .orderBy('level', 'desc')
          .onSnapshot(users => {
            this.playersInFortress = []
            users.forEach(u => {
              this.playersInFortress.push(u.data())
            })
          })
    }
  }
</script>

<style scoped>

</style>