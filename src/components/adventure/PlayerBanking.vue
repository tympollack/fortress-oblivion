<template>
  <v-container>
    <v-row><h4 style="margin: 7px 0; text-align: center">Access Thy Money</h4></v-row>

    <v-row>Gold in account: {{ player.bank | number('0,0') }}</v-row>
    <v-row>Gold on person: {{ player.gold | number('0,0') }}</v-row>

    <v-form
        ref="form"
        v-model="valid"
        lazy-validation
    >
      <v-row>
        <v-text-field
            dark
            v-model="amount"
            :rules="[rules.required, rules.integer, rules.positive]"
            label="Amount"
        ></v-text-field>
      </v-row>

      <v-row>
        <v-slider
            v-model="amount"
            color="red darken-3"
            min="0"
            :max="Math.max(player.gold, player.bank)"
            thumb-label
        ></v-slider>
      </v-row>
    </v-form>

    <v-row v-if="player.gold" class="mb-5">
      <AppButton
          :loading="loading"
          @click="depositGold()"
      >Deposit Gold</AppButton>
    </v-row>

    <v-row v-if="player.bank" class="mb-5">
      <AppButton
          :loading="loading"
          @click="withdrawGold()"
      >Withdraw Gold</AppButton>
    </v-row>

    <v-row>
      <AppButton
          :loading="loading"
          heading="leave"
          subheading="i'm done here"
          @click="leaveBank()"
      ></AppButton>
    </v-row>
  </v-container>
</template>

<script>
  import AppButton from '../app/AppButton'

  export default {
    name: 'PlayerBanking',

    components: {
      AppButton
    },

    props: {
      player: {
        type: Object,
        required: true
      }
    },

    data: () => ({
      amount: '',
      loading: false,
      valid: true,
      rules: {
        required: v => !!v || 'Required',
        integer: v => (!isNaN(v) && Number.isInteger(Number(v))) || 'Must be an integer',
        positive: v => Number(v) > 0 || 'Must be positive'
      }
    }),

    methods: {
      validateForm () {
        this.$refs.form.validate()
      },

      resetForm () {
        this.$refs.form.reset()
      },

      async leaveBank() {
        this.loading = true
        await this.$functions('actions/leave-bank')
        this.loading = false
      },

      async depositGold() {
        await this.submit('deposit')
      },

      async withdrawGold() {
        await this.submit('withdraw')
      },

      async submit(action) {
        this.validateForm()
        if (!this.valid) return

        this.loading = true
        try {
          await this.$functions(`actions/${action}-gold`, { amount: this.amount })
          this.resetForm()
        } catch(e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>