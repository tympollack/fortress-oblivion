const shareable = module.parent.shareable
const config = shareable.config
const db = shareable.db
const url = shareable.url + '/actions'

const collectionConfig = config.firestore.collections.users
const collectionFields = config.firestore.collections.users.fields
const collRef = db.collection(collectionConfig.name)

//    /internal/actions/
const routes = require('express').Router()

routes.use(async (req, res, next) => {

  console.log(req.user)
  console.log(req.method, req.path, req.body)
  const id = req.body.data.id
  const user = await getUserById(id)
  if (user) {
    req.playerUser = user
    const start = Date.now();
    const ret = await next()
    console.log(req.path, 'finished in', Date.now() - start, 'ms')
    res.status(200).json({ data: ret || {} })
  } else {
    console.error('user id not found', id)
    res.status(404).send()
  }
})

routes.post('/read-manual', markManualRead)

module.exports = routes

/////////////////////////////////////////////////////////////////////

function getUserById(id) {
  return new Promise(async resolve => {
    const doc = await collRef.doc(id).get()
    resolve(doc.data())
  })
}

async function markManualRead(req, res) {
  const user = req.playerUser
  await collRef.doc(user.id).update({ [collectionFields.status.name]: 'deciding' })
}