<template>
  <v-layout row>
    <v-flex xs12>
      <h4 class="headline">Admin Functions</h4>
    </v-flex>

    <v-flex xs6>
      <v-btn
          dark
          :loading="loading.RESET_DATABASE"
          @click="resetDatabase()"
      >Reset Database</v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'AdminScreen',

    data: () => ({
      loading: {
        RESET_DATABASE: false
      }
    }),

    methods: {
      async resetDatabase() {
        this.loading.RESET_DATABASE = true
        await this.$functions('admin-service/reset-world')
        this.loading.RESET_DATABASE = false
      }
    }

  }
</script>

<style scoped>

</style>