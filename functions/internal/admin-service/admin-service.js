const { config, db, utils } = module.parent.shareable
const collectionsConfig = config.firestore.collections

const usersCollConfig = collectionsConfig.users
const usersCollFields = usersCollConfig.fields
const usersCollRef = db.collection(usersCollConfig.name)

const worldCollConfig = collectionsConfig.world
const worldCollFields = worldCollConfig.fields
const worldCollRef = db.collection(worldCollConfig.name)

const worldStateDocRef = worldCollRef.doc(worldCollConfig.reserved.state)
const queueCollConfig = collectionsConfig.queue
const queueCollFields = queueCollConfig.fields
const queueCollRef = worldStateDocRef.collection(queueCollConfig.name)

const encountersCollConfig = collectionsConfig.encounters
const encountersCollFields = encountersCollConfig.fields
const encountersCollRef = worldStateDocRef.collection(encountersCollConfig.name)

//    /internal/admin-service/
const routes = require('express').Router()

routes.use(isAdminMiddleware)
routes.use(performanceWrapperMiddleware)

routes.post('/reset-world', resetWorld)

module.exports = routes

/////////////////////////////////////////////////////////////////////

async function isAdminMiddleware(req, res, next) {
  console.log(req.method, req.path, req.body)
  const id = req.body.data.id
  const doc = await usersCollRef.doc(id).get()
  if (!doc.exists) {
    console.error('user id not found', id)
    res.status(404).send()
    return
  }

  const user = doc.data()
  if (!user.isAdmin || !user.isGod) {
    console.error('admin access denied for', id)
    res.status(403).send()
    return
  }

  const ret = await next()
  if (!res.headersSent) {
    res.status(200).json({data: ret || {}})
  }
}

// should be last called
async function performanceWrapperMiddleware(req, res, next) {
  const start = Date.now();
  await next()
  console.log(req.path, 'finished in', Date.now() - start, 'ms')
}

/////////////////////////////////////////////////////////////////////

async function resetWorld(req, res, next) {
  console.log('started function')
  const users = await usersCollRef.get()
  const now = Date.now()
  const promises = []
  users.forEach(doc => {
    const id = doc.id
    const docRef = usersCollRef.doc(id)
    promises.push(utils.deleteCollection(db, `users/${id}/version-history`))

    const user = doc.data()
    promises.push(docRef.set({
      action: 'reset',
      chest: 0,
      created: now,
      equipment: [],
      gold: 0,
      id: user.id,
      isAdmin: user.isAdmin || false,
      isGod: user.isGod || false,
      hasKey: false,
      health: 100,
      level: 1,
      location: 'the village',
      maxHealth: 100,
      potion: 0,
      status: 'about',
      substatus: 'idle',
      timerEnd: now,
      timerLength: 0,
      timerStart: now,
      username: user.username
    }))
  })

  promises.push(utils.deleteCollection(db, 'world/state/encounters'))
  promises.push(utils.deleteCollection(db, 'world/state/queue'))

  await Promise.all(promises)
}