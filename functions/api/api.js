const shareable = module.parent.shareable
const config = shareable.config
const db = shareable.db

const collectionsConfig = config.firestore.collections

//    /api/
const routes = require('express').Router()

routes.post('/users/exists/:username', findByUsername) // must be post for httpsCallable on front end

module.exports = routes

/////////////////////////////////////////////////////////////////////

async function findByUsername(req, res) {
  const username = req.params.username
  console.log('POST /users/exists', username)

  let userFoundByUsername = false
  const users = await db.collection(collectionsConfig.users.name).where('username', '==', username).get()
  users.forEach(doc => {
    if (doc.exists) userFoundByUsername = true
  })
  console.log(userFoundByUsername ? 'found user by username' : 'user not found for username', username)
  res.status(200).json({ data: userFoundByUsername })
}