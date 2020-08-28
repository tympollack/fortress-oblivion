<template>
  <v-bottom-navigation
      dark
      grow
      color="red"
      :value="value"
  >
    <!--  here as a default to grey out all options if a diff screen focused  -->
    <v-btn style="display:none"></v-btn>

    <v-btn @click="$emit('adventure-click')">
      <span>Adventure</span>
      <v-icon>mdi-history</v-icon>
    </v-btn>

    <v-btn @click="$emit('chronicle-click')">
      <span>Chronicle</span>
      <v-icon>mdi-heart</v-icon>
    </v-btn>

    <v-btn @click="$emit('chat-click')">
      <span>Chat</span>
      <v-icon>mdi-map-marker</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
  export default {
    name: 'BottomNav',

    props: {
      value: Number
    }
  }
</script>

<style scoped>

</style>