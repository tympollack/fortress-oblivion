<template>
  <v-layout row>
    <v-flex xs12>
      <h4 class="headline">Admin Functions</h4>
    </v-flex>

    <v-flex xs6>
      <AppButton
          :loading="loading"
          @click="resetDatabase()"
      >Reset Database</AppButton>
    </v-flex>
  </v-layout>
</template>

<script>
  import AppButton from '../app/AppButton'

  export default {
    name: 'AdminScreen',
    components: {
      AppButton
    },

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