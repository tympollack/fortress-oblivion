import Vue from 'vue'
import Vuex from 'vuex'
import Vue2Filters from 'vue2-filters'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import firebase from './config/firebase'
// import store from './store/store'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false
Vue.prototype.$firebase = firebase
Vue.prototype.$timestamp = firebase.firestore.FieldValue.serverTimestamp()
Vue.prototype.$functions = async (path, data = {}) => {
    return await firebase.functions().httpsCallable(`internal/${path}`)({
        ...data,
        id: firebase.auth().currentUser.uid
    })
}

Vue.use(Vuex)
Vue.use(Vue2Filters)

new Vue({
    // store,
    vuetify,
    render: h => h(App),
}).$mount('#app')
