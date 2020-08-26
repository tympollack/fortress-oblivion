import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

import firebaseConfig from './firebase-key-no-commit'

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig)

if (window.location.hostname === 'localhost') {
  firebase.firestore().settings({ host: 'localhost:8080', ssl: false })
  firebase.functions().useFunctionsEmulator('http://localhost:5001')
}

export default firebase