<template>
  <div v-if="!player">
    <UsernamePrompt v-if="needUsername"></UsernamePrompt>
  </div>
  <div v-else>welcome, {{ player.username }}</div>
</template>

<script>


  import UsernamePrompt from './UsernamePrompt'
  export default {
    name: 'AdventureScreen',
    components: {UsernamePrompt},
    data: () => ({
      player: null,
      needUsername: false
    }),

    created() {
      // this.$firebase.functions().httpsCallable(`internal/users/`)({
      //   id: userId,
      //   username:
      // })
      const userId = this.$firebase.auth().currentUser.uid
      this.$firebase.firestore().collection('users').doc(userId).onSnapshot(doc => {
        if (doc.exists) {
          this.player = doc.data()
        } else {
          this.needUsername = true
        }
      })
    }
  }
</script>

<style scoped>

</style>