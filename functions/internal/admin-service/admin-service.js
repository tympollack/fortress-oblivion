const moment = require('moment')
const { config, db, utils } = module.parent.shareable
const collectionsConfig = config.firestore.collections

const chatCollConfig = collectionsConfig.chat
const chatCollFields = chatCollConfig.fields
const chatCollRef = db.collection(chatCollConfig.name)

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

routes.post('/database-init', databaseInit)
routes.post('/is-database-init', isDatabaseInit)
routes.post('/reset-world', resetWorld)
routes.post('/finish-player-timer', finishPlayerTimer)
routes.post('/delete-player', deletePlayer)
routes.post('/resolve-dispute', resolveDispute)
routes.post('/send-player-alert', sendPlayerAlert)
routes.post('/send-system-message', sendSystemMessage)

routes.use(sendBack)

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
  if (!user.isAdmin && !user.isGod) {
    console.error('admin access denied for', id)
    res.status(403).send()
    return
  }

  await next()
}

// should be last called
async function performanceWrapperMiddleware(req, res, next) {
  const start = Date.now()
  const ret = await next()
  console.log(req.path, 'finished in', Date.now() - start, 'ms')
  return ret
}

// afterware
async function sendBack(req, res, next) {
  const { ret } = req
  if (!res.headersSent) {
    res.status(200).json({data: ret || {}})
  }
  next()
}

/////////////////////////////////////////////////////////////////////

async function databaseInit(req, res, next) {
  const time = Date.now()
  const worldStateDocRef = worldCollRef.doc(worldCollConfig.reserved.state + '')
  const systemChatDocRef = chatCollRef.doc('system')
  const publicChatDocRef = chatCollRef.doc('public')

  await Promise.all([
    worldStateDocRef.set({
      initialized: time
    }),
    systemChatDocRef.set({
      all: true,
      pinned: true,
      public: true,
      restricted: true,
      group: true,
      title: 'System Alerts'
    }),
    systemChatDocRef.collection('messages').add({
      content: `System has been initialized as of ${moment(time).format('YYYY-MM-DD HH:mm')}.`,
      created: time,
      sender: '💩',
      senderId: 'system'
    }),
    publicChatDocRef.set({
      all: true,
      pinned: true,
      public: true,
      restricted: false,
      group: true,
      title: 'Public Chat'
    })
  ])
  next()
}

async function isDatabaseInit(req, res, next) {
  const chatDoc = await chatCollRef.doc('system').get()
  req.ret = { isDbInit: chatDoc.exists }
  next()
}

async function resetWorld(req, res, next) {
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
      expansionsOwned: user.expansionsOwned || 'WRG1BEHFC2KUAMLNP',
      gold: 0,
      id: user.id,
      isAdmin: user.isAdmin || false,
      isGod: user.isGod || false,
      hasKey: false,
      health: 100,
      level: 1,
      location: 'the village',
      maxHealth: 100,
      restHealth: 100,
      potion: 0,
      status: 'about',
      substatus: 'idle',
      timerEnd: now,
      timerLength: 0,
      timerMessage: '',
      timerStart: now,
      timezone: user.timezone || '',
      username: user.username
    }))
  })

  promises.push(utils.deleteCollection(db, 'world/state/encounters'))
  promises.push(utils.deleteCollection(db, 'world/state/queue'))

  await Promise.all(promises)
  next()
}

async function sendSystemMessage(req, res, next) {
  await chatCollRef.doc('system').collection('messages').add({
    content: req.body.data.message,
    created: Date.now(),
    sender: '💩',
    senderId: 'system'
  })
  next()
}

async function sendPlayerAlert(req, res, next) {
  const { playerIds, message } = req.body.data
  const batch = db.batch()

  for (const id of playerIds) {
    console.log(id)
    batch.update(usersCollRef.doc(id + ''), {
      [usersCollFields.playerAlert.name]: message,
      [usersCollFields.playerAlertSeen.name]: false,
    })
  }

  await batch.commit()
  next()
}

async function finishPlayerTimer(req, res, next) {
  const { managedId } = req.body.data
  await usersCollRef.doc(managedId).update({
    [usersCollFields.action.name]: 'ADMIN-finish-timer',
    [usersCollFields.timerEnd.name]: Date.now(),
    [usersCollFields.timerLength.name]: 0
  })
  next()
}

async function deletePlayer(req, res, next) {
  const { managedId } = req.body.data
  await utils.deleteCollection(db, `users/${managedId}/version-history`)
  await usersCollRef.doc(managedId).delete()
  next()
}

async function resolveDispute(req, res, next) {
  const { id, encounterId, winnerId, loserId, result } = req.body.data
  const getPlayerVersionBeforeEncounter = async (uid) => {
    const docs = await usersCollRef
        .doc(uid)
        .collection('version-history')
        .where('status', '==', 'queueing')
        .orderBy('actionTime', 'desc')
        .limit(1)
        .get()

    let ret = null
    docs.forEach(doc => {
      ret = doc.data()
    })
    return ret
  }

  const [winner, loser] = await Promise.all([
      getPlayerVersionBeforeEncounter(winnerId),
      getPlayerVersionBeforeEncounter(loserId)
  ])

  await Promise.all([
      encountersCollRef.doc(encounterId).update({
        [encountersCollFields.disputeResolvedBy.name]: id,
        [encountersCollFields.result.name]: Math.abs(result),
        [encountersCollFields.winner.name]: winnerId,
        [encountersCollFields.loser.name]: loserId,
      }),
      utils.updateUserFieldsForUser(winner, {
        ...winner,
        [usersCollFields.encounterResult.name]: result,
        [usersCollFields.status.name]: 'deciding',
        [usersCollFields.substatus.name]: 'post-win',
        [usersCollFields.timerLength.name]: 0,
        [usersCollFields.timerEnd.name]: 0,
        [usersCollFields.timerStart.name]: 0,
      }),
      utils.updateUserFieldsForUser(loser, {
        ...loser,
        [usersCollFields.encounterResult.name]: result * -1,
        [usersCollFields.status.name]: 'deciding',
        [usersCollFields.substatus.name]: 'post-loss',
        [usersCollFields.timerLength.name]: 0,
        [usersCollFields.timerEnd.name]: 0,
        [usersCollFields.timerStart.name]: 0,
      })
  ])
  next()
}