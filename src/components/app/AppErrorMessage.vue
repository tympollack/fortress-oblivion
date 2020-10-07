<template>
  <v-row
    v-if="!!message"
    :class=cssClass
    justify="center">
    <h4 class="error--text">
      {{ message }}
    </h4>
  </v-row>
</template>

<script>
  export default {
    name: 'AppErrorMessage',

    props: {
      cssClass: String,
      message: String
    }
  }
</script>

<style scoped>

</style>