<template>
  <v-select
      dark
      :items="options"
      v-model="privateSelected"
      @change="$emit('update:selected', privateSelected)"
  ></v-select>
</template>

<script>
  export default {
    name: 'TimezonePicker',

    data: () => ({
      timezones: [
        "Etc/GMT+12",
        "Pacific/Midway",
        "Pacific/Honolulu",
        "America/Juneau",
        "America/Dawson",
        "America/Boise",
        "America/Chihuahua",
        "America/Phoenix",
        "America/Chicago",
        "America/Regina",
        "America/Mexico_City",
        "America/Belize",
        "America/Detroit",
        "America/Indiana/Indianapolis",
        "America/Bogota",
        "America/Glace_Bay",
        "America/Caracas",
        "America/Santiago",
        "America/St_Johns",
        "America/Sao_Paulo",
        "America/Argentina/Buenos_Aires",
        "America/Godthab",
        "Etc/GMT+2",
        "Atlantic/Azores",
        "Atlantic/Cape_Verde",
        "GMT",
        "Africa/Casablanca",
        "Atlantic/Canary",
        "Europe/Belgrade",
        "Europe/Sarajevo",
        "Europe/Brussels",
        "Europe/Amsterdam",
        "Africa/Algiers",
        "Europe/Bucharest",
        "Africa/Cairo",
        "Europe/Helsinki",
        "Europe/Athens",
        "Asia/Jerusalem",
        "Africa/Harare",
        "Europe/Moscow",
        "Asia/Kuwait",
        "Africa/Nairobi",
        "Asia/Baghdad",
        "Asia/Tehran",
        "Asia/Dubai",
        "Asia/Baku",
        "Asia/Kabul",
        "Asia/Yekaterinburg",
        "Asia/Karachi",
        "Asia/Kolkata",
        "Asia/Kathmandu",
        "Asia/Dhaka",
        "Asia/Colombo",
        "Asia/Almaty",
        "Asia/Rangoon",
        "Asia/Bangkok",
        "Asia/Krasnoyarsk",
        "Asia/Shanghai",
        "Asia/Kuala_Lumpur",
        "Asia/Taipei",
        "Australia/Perth",
        "Asia/Irkutsk",
        "Asia/Seoul",
        "Asia/Tokyo",
        "Asia/Yakutsk",
        "Australia/Darwin",
        "Australia/Adelaide",
        "Australia/Sydney",
        "Australia/Brisbane",
        "Australia/Hobart",
        "Asia/Vladivostok",
        "Pacific/Guam",
        "Asia/Magadan",
        "Pacific/Fiji",
        "Pacific/Auckland",
        "Pacific/Tongatapu"
      ],
      privateSelected: '',
    }),

    props: {
      selected: String,
    },

    created() {
      this.options = this.$timezones.tz.names()
          .filter(tz => this.timezones.includes(tz))
          .reduce((memo, tz) => {
            memo.push({
              name: tz,
              offset: this.$timezones.tz(tz).utcOffset()
            });

            return memo;
          }, [])
          .sort((a, b) => {
            return a.offset - b.offset
          })
          .map(tz => {
            const timezone = tz.offset ? this.$timezones.tz(tz.name).format('Z') : '';
            return `(GMT${timezone}) ${tz.name}`;
          }, "")

      this.privateSelected = this.selected
    }
  }
</script>

<style scoped>

</style>