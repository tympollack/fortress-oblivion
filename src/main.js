import Vue from 'vue'
import Vuex from 'vuex'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import firebase from './config/firebase'
// import store from './store/store'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false
Vue.prototype.$firebase = firebase

Vue.use(Vuex)

new Vue({
    // store,
    vuetify,
    render: h => h(App),
}).$mount('#app')
